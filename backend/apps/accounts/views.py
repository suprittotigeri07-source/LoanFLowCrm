import re
import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from io import BytesIO
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    CreateTelecallerSerializer,
    CreateAsmSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
)
from .permissions import IsAdminRole, IsAdminOrASM
from .emails import send_telecaller_credentials_email, send_password_reset_email


class CustomLoginView(TokenObtainPairView):
    """Custom JWT login supporting Employee ID or Email with status validation."""
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserProfileView(APIView):
    """Retrieve logged-in user profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CreateTelecallerAPIView(APIView):
    """Admin endpoint to create a Telecaller and automatically email login credentials."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request):
        serializer = CreateTelecallerSerializer(data=request.data)
        if serializer.is_valid():
            raw_password = request.data.get('password')
            user = serializer.save(created_by=request.user)

            email_sent = send_telecaller_credentials_email(user, raw_password)

            msg = (
                "Telecaller created successfully. Login credentials have been sent to the registered email address."
                if email_sent
                else "Telecaller created successfully, but the credentials email could not be delivered."
            )

            return Response({
                "message": msg,
                "email_sent": email_sent,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateAsmAPIView(APIView):
    """Admin endpoint to create an ASM and automatically email login credentials."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request):
        serializer = CreateAsmSerializer(data=request.data)
        if serializer.is_valid():
            raw_password = request.data.get('password')
            user = serializer.save(created_by=request.user)

            email_sent = send_telecaller_credentials_email(user, raw_password)

            msg = (
                "ASM created successfully. Login credentials have been sent to the registered email address."
                if email_sent
                else "ASM created successfully, but the credentials email could not be delivered."
            )

            return Response({
                "message": msg,
                "email_sent": email_sent,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DownloadUserTemplateAPIView(APIView):
    """
    Generates and downloads a clean, blank Excel template (.xlsx) with headers ONLY.
    NO EXAMPLE DATA ROWS.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        query_params = getattr(request, 'query_params', request.GET)
        role = query_params.get('role', 'TELECALLER').upper()
        wb = openpyxl.Workbook()
        ws = wb.active if wb.active is not None else wb.create_sheet()

        if role == 'ASM':
            ws.title = "ASM Import Template"
            headers = ["Full Name", "Employee ID", "Email", "Mobile Number", "Branch / Location", "Password", "Status"]
            filename = "ASM_Import_Template.xlsx"
        else:
            ws.title = "Telecaller Import Template"
            headers = ["Full Name", "Employee ID", "Email", "Mobile Number", "Branch / Location", "ASM Employee ID", "Password", "Status"]
            filename = "Telecaller_Import_Template.xlsx"

        ws.append(headers)

        # Style header row
        for col in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
            cell.alignment = Alignment(horizontal="center")
            ws.column_dimensions[get_column_letter(col)].width = 24

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ValidateExcelUserImportAPIView(APIView):
    """
    Validates uploaded Excel file for user import.
    Checks for required fields, duplicate employee IDs/emails/mobiles (against DB and within Excel),
    and validates ASM Employee ID existence for Telecallers.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No Excel file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = request.FILES['file']
        target_role = request.data.get('role', 'TELECALLER').upper()

        try:
            wb = openpyxl.load_workbook(excel_file, data_only=True)
            ws = wb.active or (wb.worksheets[0] if wb.worksheets else wb.create_sheet())
        except Exception as e:
            return Response({"error": f"Invalid Excel file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        rows = list(ws.iter_rows(values_only=True))
        if len(rows) <= 1:
            return Response({"error": "The Excel file contains no data rows."}, status=status.HTTP_400_BAD_REQUEST)

        headers = [str(h).strip() if h else '' for h in rows[0]]
        
        # Determine column indexes
        def get_idx(name_variants):
            for idx, h in enumerate(headers):
                if any(v.lower() in h.lower() for v in name_variants):
                    return idx
            return -1

        idx_name = get_idx(["full name", "name"])
        idx_emp_id = get_idx(["employee id", "emp id", "employee_id"])
        idx_email = get_idx(["email"])
        idx_mobile = get_idx(["mobile number", "mobile", "phone"])
        idx_branch = get_idx(["branch", "location"])
        idx_asm_emp = get_idx(["asm employee id", "asm emp id", "asm_employee_id", "reporting manager"])
        idx_password = get_idx(["password"])
        idx_status = get_idx(["status"])

        # Fetch existing unique fields from DB for duplicate checking
        existing_emp_ids = set(User.objects.values_list('employee_id', flat=True))
        existing_emails = set(User.objects.values_list('email', flat=True))
        existing_mobiles = set(User.objects.exclude(mobile__isnull=True).exclude(mobile='').values_list('mobile', flat=True))
        
        asm_map = {}
        if target_role == 'TELECALLER':
            asm_map = {
                u.employee_id.upper(): u for u in User.objects.filter(role=User.Role.ASM, is_deleted=False) if u.employee_id
            }

        seen_file_emp_ids = set()
        seen_file_emails = set()
        seen_file_mobiles = set()

        preview_rows = []
        valid_count = 0
        error_count = 0
        duplicate_count = 0

        email_regex = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

        for row_num, r in enumerate(rows[1:], start=2):
            if not any(r):
                continue  # Skip completely empty rows

            name = str(r[idx_name]).strip() if idx_name != -1 and r[idx_name] is not None else ""
            emp_id = str(r[idx_emp_id]).strip() if idx_emp_id != -1 and r[idx_emp_id] is not None else ""
            email = str(r[idx_email]).strip().lower() if idx_email != -1 and r[idx_email] is not None else ""
            mobile = str(r[idx_mobile]).strip() if idx_mobile != -1 and r[idx_mobile] is not None else ""
            branch = str(r[idx_branch]).strip() if idx_branch != -1 and r[idx_branch] is not None else ""
            asm_emp_id = str(r[idx_asm_emp]).strip() if idx_asm_emp != -1 and r[idx_asm_emp] is not None else ""
            raw_password = str(r[idx_password]).strip() if idx_password != -1 and r[idx_password] is not None else ""
            status_val = str(r[idx_status]).strip() if idx_status != -1 and r[idx_status] is not None else "Active"

            errors = []
            val_status = "VALID"

            # 1. Required Field Validation
            if not name:
                errors.append("Full Name is required.")
            if not emp_id:
                errors.append("Employee ID is required.")
            if not email:
                errors.append("Email is required.")
            elif not email_regex.match(email):
                errors.append("Invalid email format.")
            if not mobile:
                errors.append("Mobile Number is required.")
            if not raw_password:
                errors.append("Password is required.")

            # 2. Duplicate Validation (DB Level)
            if emp_id and emp_id in existing_emp_ids:
                val_status = "DUPLICATE"
                errors.append("Employee ID already exists in database.")
            if email and email in existing_emails:
                val_status = "DUPLICATE" if val_status != "ERROR" else "ERROR"
                errors.append("Email already exists in database.")
            if mobile and mobile in existing_mobiles:
                val_status = "DUPLICATE" if val_status != "ERROR" else "ERROR"
                errors.append("Mobile number already exists in database.")

            # 3. Duplicate Validation (File Level)
            if emp_id and emp_id.upper() in seen_file_emp_ids:
                val_status = "DUPLICATE"
                errors.append("Duplicate Employee ID in Excel file.")
            if email and email in seen_file_emails:
                val_status = "DUPLICATE"
                errors.append("Duplicate Email in Excel file.")
            if mobile and mobile in seen_file_mobiles:
                val_status = "DUPLICATE"
                errors.append("Duplicate Mobile Number in Excel file.")

            # 4. ASM Employee ID Check for Telecallers
            asm_obj_id = None
            asm_obj_name = None
            if target_role == 'TELECALLER' and asm_emp_id:
                if asm_emp_id.upper() in asm_map:
                    asm_obj = asm_map[asm_emp_id.upper()]
                    asm_obj_id = str(asm_obj.id)
                    asm_obj_name = asm_obj.name
                else:
                    errors.append(f"ASM Employee ID '{asm_emp_id}' does not exist.")

            if errors and val_status != "DUPLICATE":
                val_status = "ERROR"

            if val_status == "VALID":
                valid_count += 1
                if emp_id:
                    seen_file_emp_ids.add(emp_id.upper())
                if email:
                    seen_file_emails.add(email)
                if mobile:
                    seen_file_mobiles.add(mobile)
            elif val_status == "DUPLICATE":
                duplicate_count += 1
            else:
                error_count += 1

            preview_rows.append({
                "row_number": row_num,
                "name": name,
                "employee_id": emp_id,
                "email": email,
                "mobile": mobile,
                "branch": branch,
                "asm_employee_id": asm_emp_id,
                "asm_id": asm_obj_id,
                "asm_name": asm_obj_name,
                "password": raw_password,
                "status": status_val,
                "is_active": status_val.lower() != 'inactive',
                "validation_status": val_status,
                "error_message": " | ".join(errors) if errors else None
            })

        return Response({
            "role": target_role,
            "total_rows": len(preview_rows),
            "valid_count": valid_count,
            "error_count": error_count,
            "duplicate_count": duplicate_count,
            "rows": preview_rows
        }, status=status.HTTP_200_OK)


class ImportExcelUsersAPIView(APIView):
    """
    Executes Excel bulk user creation for valid rows.
    Hashes passwords securely, triggers credentials email, updates email status.
    Provides downloadable error report metadata for invalid rows.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request):
        rows = request.data.get('rows', [])
        target_role = request.data.get('role', 'TELECALLER').upper()

        if not rows:
            return Response({"error": "No user rows provided for import."}, status=status.HTTP_400_BAD_REQUEST)

        successfully_created = 0
        failed = 0
        skipped = 0
        error_reports = []

        for item in rows:
            val_status = item.get('validation_status')
            row_num = item.get('row_number', '?')
            emp_id = item.get('employee_id', '')

            if val_status != 'VALID':
                skipped += 1
                error_reports.append({
                    "row_number": row_num,
                    "employee_id": emp_id,
                    "reason": item.get('error_message') or "Skipped due to validation error"
                })
                continue

            try:
                name = item.get('name')
                email = item.get('email')
                mobile = item.get('mobile')
                branch = item.get('branch')
                raw_password = item.get('password')
                is_active = item.get('is_active', True)
                asm_id = item.get('asm_id')

                # Re-verify DB uniqueness right before insertion
                if User.objects.filter(Q(employee_id__iexact=emp_id) | Q(email__iexact=email)).exists():
                    failed += 1
                    error_reports.append({
                        "row_number": row_num,
                        "employee_id": emp_id,
                        "reason": "Employee ID or Email already exists in database."
                    })
                    continue

                user = User(
                    name=name,
                    employee_id=emp_id,
                    email=email,
                    mobile=mobile,
                    branch=branch,
                    role=User.Role.TELECALLER if target_role == 'TELECALLER' else User.Role.ASM,
                    is_active=is_active,
                    must_change_password=True,
                    created_by=request.user,
                )

                if target_role == 'TELECALLER' and asm_id:
                    asm_user = User.objects.filter(id=asm_id, role=User.Role.ASM).first()
                    if asm_user:
                        user.asm = asm_user

                user.set_password(raw_password)
                user.save()

                # Trigger credential email
                email_sent = send_telecaller_credentials_email(user, raw_password)
                if not email_sent:
                    user.credentials_email_status = User.EmailStatus.FAILED
                    user.save(update_fields=['credentials_email_status'])

                successfully_created += 1

            except Exception as e:
                failed += 1
                error_reports.append({
                    "row_number": row_num,
                    "employee_id": emp_id,
                    "reason": f"System error during import: {str(e)}"
                })

        return Response({
            "message": f"Import completed. {successfully_created} user(s) created.",
            "successfully_created": successfully_created,
            "failed": failed,
            "skipped": skipped,
            "error_reports": error_reports
        }, status=status.HTTP_200_OK)


class ResendCredentialsAPIView(APIView):
    """Resends login credentials to Telecaller/ASM registered email address."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        raw_password = request.data.get('password') or "PasswordNotProvided123"

        email_sent = send_telecaller_credentials_email(user, raw_password)

        if email_sent:
            return Response({"message": "Login credentials have been resent successfully.", "email_status": "Credentials Sent"}, status=status.HTTP_200_OK)
        return Response({"error": "Unable to send email. Please check email settings."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordAPIView(APIView):
    """Admin resets a Telecaller's password."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            new_password = serializer.validated_data['new_password']
            user.set_password(new_password)
            user.must_change_password = True
            user.save()

            email_sent = send_password_reset_email(user, new_password)

            return Response({
                "message": "Password reset successfully. Email notification sent.",
                "email_sent": email_sent
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordAPIView(APIView):
    """User changes their password (e.g. on first login)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Current password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.must_change_password = False
            user.save()

            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ToggleUserStatusAPIView(APIView):
    """Activate or Deactivate user account."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        status_text = "activated" if user.is_active else "deactivated"
        return Response({"message": f"User account {user.name} has been {status_text}.", "is_active": user.is_active}, status=status.HTTP_200_OK)


class DeleteUserAPIView(APIView):
    """Soft deletes a user account preserving historical lead and call logs."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_deleted = True
        user.is_active = False
        user.save()
        return Response({"message": f"User {user.name} deleted (soft delete). Historical records preserved."}, status=status.HTTP_200_OK)


class RestoreUserAPIView(APIView):
    """Restores a soft-deleted user account."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_deleted = False
        user.is_active = True
        user.save()
        return Response({"message": f"User {user.name} restored successfully."}, status=status.HTTP_200_OK)


class AsmListView(generics.ListAPIView):
    """List all ASMs for Admin selection."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = UserSerializer
    pagination_class = None

    def get_queryset(self):
        query_params = getattr(self.request, 'query_params', self.request.GET)
        include_deleted = query_params.get('include_deleted', 'false').lower() == 'true'
        qs = User.objects.filter(role=User.Role.ASM)
        if not include_deleted:
            qs = qs.filter(is_deleted=False)
        return qs


class TelecallerListView(generics.ListAPIView):
    """List telecallers (Admin gets all, ASM gets assigned team)."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrASM]
    serializer_class = UserSerializer
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        query_params = getattr(self.request, 'query_params', self.request.GET)
        include_deleted = query_params.get('include_deleted', 'false').lower() == 'true'
        qs = User.objects.filter(role=User.Role.TELECALLER)
        if not include_deleted:
            qs = qs.filter(is_deleted=False)

        if isinstance(user, User) and user.role == User.Role.ASM:
            qs = qs.filter(asm=user)
        return qs
