import io
import csv
from decimal import Decimal, InvalidOperation
from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from accounts.models import User
from accounts.permissions import IsAdminRole, IsAdminOrASM, IsLeadOwnerOrManager
from audit.models import AuditLog
from .models import Customer, Lead, hash_mobile
from .serializers import LeadListSerializer, LeadDetailSerializer, LeadCreateUpdateSerializer


class LeadViewSet(viewsets.ModelViewSet):
    """
    Lead Management with strict Server-Side Role-Based Access Control:
    - ADMIN: Full access to all leads.
    - ASM: Access to leads within their territory.
    - TELECALLER: Strictly isolated to leads where assigned_to == request.user.
    """
    permission_classes = [permissions.IsAuthenticated, IsLeadOwnerOrManager]

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return LeadDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return LeadCreateUpdateSerializer
        return LeadListSerializer

    def get_queryset(self):
        user = self.request.user
        if not isinstance(user, User):
            return Lead.objects.none()

        qs = Lead.objects.all().select_related('customer', 'assigned_to')

        if user.role == User.Role.ADMIN:
            pass  # Full access
        elif user.role == User.Role.ASM:
            if user.territory:
                qs = qs.filter(
                    Q(customer__city__icontains=user.territory) |
                    Q(assigned_to__territory__icontains=user.territory)
                )
        elif user.role == User.Role.TELECALLER:
            # Server-side isolation: telecaller CANNOT query another telecaller's leads
            qs = qs.filter(assigned_to=user)
        else:
            qs = Lead.objects.none()

        # Optional query param filters
        query_params = getattr(self.request, 'query_params', self.request.GET)
        status_filter = query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        assigned_filter = query_params.get('assigned_to')
        if assigned_filter and user.role in [User.Role.ADMIN, User.Role.ASM]:
            if assigned_filter == 'unassigned':
                qs = qs.filter(assigned_to__isnull=True)
            else:
                qs = qs.filter(assigned_to_id=assigned_filter)

        search_query = query_params.get('search')
        if search_query:
            qs = qs.filter(
                Q(business_name__icontains=search_query) |
                Q(customer__name__icontains=search_query) |
                Q(customer__mobile__icontains=search_query)
            )

        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Audit log for accessing sensitive financial & CIBIL data
        AuditLog.objects.create(
            user=request.user,
            lead=instance,
            action=AuditLog.Action.VIEW_SENSITIVE,
            field_name='financials_and_cibil',
            old_value=None,
            new_value=f"Viewed profile of {instance.business_name} (CIBIL: {instance.cibil_range})",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class TelecallerQueueView(APIView):
    """
    Dedicated endpoint for the Telecaller App:
    Returns the calling queue for the logged-in telecaller.
    Shows one lead at a time or the ordered priority list.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not isinstance(user, User) or (user.role != User.Role.TELECALLER and user.role != User.Role.ADMIN):
            return Response(
                {"detail": "Calling queue is only available for telecaller accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Priority ordering: New leads first, then Contacted
        leads = Lead.objects.filter(
            assigned_to=user,
            status__in=[Lead.PipelineStage.NEW_LEAD, Lead.PipelineStage.CONTACTED, Lead.PipelineStage.INTERESTED]
        ).select_related('customer').order_by('created_at')

        # Check if single lead is requested (one-lead-at-a-time flow)
        query_params = getattr(request, 'query_params', request.GET)
        if query_params.get('single') == 'true':
            next_lead = leads.first()
            if not next_lead:
                return Response({"lead": None, "message": "No pending leads in your queue. Great job!"})
            serializer = LeadDetailSerializer(next_lead)
            return Response({"lead": serializer.data, "remaining_count": leads.count()})

        serializer = LeadListSerializer(leads, many=True)
        return Response({
            "count": leads.count(),
            "leads": serializer.data
        })


class CsvLeadUploadView(APIView):
    """
    Admin CSV lead upload endpoint:
    - Parses CSV headers
    - Validates required fields
    - Normalizes & checks for duplicate mobile numbers (flags rather than duplicating)
    - Creates customer & lead records
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded. Please provide a CSV file."}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith('.csv'):
            return Response({"error": "File must be a .csv format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = file.read().decode('utf-8-sig')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
        except Exception as e:
            return Response({"error": f"Failed to read CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        total_rows = 0
        created_count = 0
        duplicate_count = 0
        duplicates = []
        errors = []

        with transaction.atomic():
            for row_idx, row in enumerate(reader, start=1):
                total_rows += 1
                # Standardize column lookups (case-insensitive & stripped)
                clean_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}

                # Helper to find key among variations
                def get_field(*keys, default=""):
                    for key in keys:
                        if key in clean_row and clean_row[key]:
                            return clean_row[key]
                    return default

                customer_name = get_field('name', 'customer_name', 'client_name', 'full_name')
                mobile = get_field('mobile', 'phone', 'contact', 'mobile_number')
                business_name = get_field('business_name', 'company_name', 'firm_name', 'enterprise')
                loan_amt_str = get_field('required_loan_amount', 'loan_amount', 'amount', 'loan_req')

                # Validation
                if not customer_name or not mobile or not business_name or not loan_amt_str:
                    errors.append({
                        "row": row_idx,
                        "error": "Missing required fields (name, mobile, business_name, or required_loan_amount)"
                    })
                    continue

                # Clean mobile number
                cleaned_mobile = "".join(filter(str.isdigit, str(mobile)))
                if len(cleaned_mobile) > 10:
                    cleaned_mobile = cleaned_mobile[-10:]

                if len(cleaned_mobile) < 10:
                    errors.append({
                        "row": row_idx,
                        "mobile": mobile,
                        "error": "Invalid mobile number (must be at least 10 digits)"
                    })
                    continue

                # Duplicate check via SHA256 mobile hash
                m_hash = hash_mobile(cleaned_mobile)
                if Customer.objects.filter(mobile_hash=m_hash).exists():
                    duplicate_count += 1
                    duplicates.append({
                        "row": row_idx,
                        "name": customer_name,
                        "mobile": mobile,
                        "business_name": business_name,
                        "reason": "Customer with this mobile number already exists in CRM"
                    })
                    continue

                # Parse loan amount
                try:
                    clean_amt = loan_amt_str.replace(',', '').replace('₹', '').strip()
                    required_loan_amount = Decimal(clean_amt)
                except (InvalidOperation, ValueError):
                    errors.append({
                        "row": row_idx,
                        "error": f"Invalid loan amount value: '{loan_amt_str}'"
                    })
                    continue

                # Optional fields
                alt_mobile = get_field('alt_mobile', 'alternate_mobile')
                city = get_field('city', 'location')
                pincode = get_field('pincode', 'pin')
                business_type = get_field('business_type', 'constitution', default='Proprietorship')

                vintage_val = None
                vintage_str = get_field('vintage', 'years_in_business')
                if vintage_str:
                    try:
                        vintage_val = Decimal(vintage_str.replace('years', '').replace('yrs', '').strip())
                    except (InvalidOperation, ValueError):
                        pass

                monthly_turnover = None
                monthly_to_str = get_field('monthly_turnover', 'monthly_sales')
                if monthly_to_str:
                    try:
                        monthly_turnover = Decimal(monthly_to_str.replace(',', '').strip())
                    except (InvalidOperation, ValueError):
                        pass

                annual_turnover = None
                annual_to_str = get_field('annual_turnover', 'annual_sales')
                if annual_to_str:
                    try:
                        annual_turnover = Decimal(annual_to_str.replace(',', '').strip())
                    except (InvalidOperation, ValueError):
                        pass

                gst_val = get_field('gst_available', 'gst').lower() in ('yes', 'true', '1', 'available')
                itr_val = get_field('itr_available', 'itr').lower() in ('yes', 'true', '1', 'available')
                banking_val = get_field('banking_available', 'banking').lower() in ('yes', 'true', '1', 'available')
                cibil_range = get_field('cibil_range', 'cibil', 'cibil_score')
                loan_type = get_field('loan_type', default='Business Loan')
                ownership_type = get_field('ownership_type', default='Rented')

                # Create customer & lead
                customer = Customer.objects.create(
                    name=customer_name,
                    mobile=cleaned_mobile,
                    alt_mobile=alt_mobile or None,
                    city=city or None,
                    pincode=pincode or None,
                )

                Lead.objects.create(
                    customer=customer,
                    business_name=business_name,
                    business_type=business_type,
                    vintage=vintage_val,
                    ownership_type=ownership_type,
                    gst_available=gst_val,
                    itr_available=itr_val,
                    banking_available=banking_val,
                    monthly_turnover=monthly_turnover,
                    annual_turnover=annual_turnover,
                    cibil_range=cibil_range or None,
                    required_loan_amount=required_loan_amount,
                    loan_type=loan_type,
                    lead_source='CSV Upload',
                    status=Lead.PipelineStage.NEW_LEAD,
                    assigned_to=None  # Unassigned, ready for allocation
                )
                created_count += 1

        return Response({
            "message": "CSV processing complete",
            "total_rows": total_rows,
            "created_count": created_count,
            "duplicate_count": duplicate_count,
            "duplicates_flagged": duplicates,
            "errors": errors,
        }, status=status.HTTP_201_CREATED if created_count > 0 else status.HTTP_200_OK)


class LeadAssignmentView(APIView):
    """
    Lead assignment system:
    - Assign single or multiple leads to a designated telecaller
    - Round-robin assignment across a list of telecallers
    - Records an immutable audit log entry for each assignment
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrASM]

    def post(self, request):
        lead_ids = request.data.get('lead_ids', [])
        telecaller_id = request.data.get('telecaller_id')
        telecaller_ids = request.data.get('telecaller_ids', [])

        if not lead_ids:
            return Response({"error": "No lead_ids provided for assignment."}, status=status.HTTP_400_BAD_REQUEST)

        leads = Lead.objects.filter(id__in=lead_ids)
        if not leads.exists():
            return Response({"error": "No matching leads found."}, status=status.HTTP_404_NOT_FOUND)

        # Single telecaller target
        if telecaller_id:
            try:
                target_caller = User.objects.get(id=telecaller_id, role=User.Role.TELECALLER, is_active=True)
            except User.DoesNotExist:
                return Response({"error": "Selected telecaller does not exist or is inactive."}, status=status.HTTP_400_BAD_REQUEST)

            updated_count = 0
            for lead in leads:
                old_assignee = lead.assigned_to.name if lead.assigned_to else "Unassigned"
                lead.assigned_to = target_caller
                lead.save(update_fields=['assigned_to', 'updated_at'])

                AuditLog.objects.create(
                    user=request.user,
                    lead=lead,
                    action=AuditLog.Action.LEAD_ASSIGNMENT,
                    field_name='assigned_to',
                    old_value=old_assignee,
                    new_value=target_caller.name,
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                updated_count += 1

            return Response({
                "message": f"Successfully assigned {updated_count} lead(s) to {target_caller.name}.",
                "assigned_count": updated_count
            })

        # Round-robin target across multiple telecallers
        if telecaller_ids:
            active_callers = list(User.objects.filter(id__in=telecaller_ids, role=User.Role.TELECALLER, is_active=True))
            if not active_callers:
                return Response({"error": "No active telecallers found for the provided IDs."}, status=status.HTTP_400_BAD_REQUEST)

            updated_count = 0
            caller_idx = 0
            num_callers = len(active_callers)

            for lead in leads:
                target_caller = active_callers[caller_idx % num_callers]
                old_assignee = lead.assigned_to.name if lead.assigned_to else "Unassigned"
                lead.assigned_to = target_caller
                lead.save(update_fields=['assigned_to', 'updated_at'])

                AuditLog.objects.create(
                    user=request.user,
                    lead=lead,
                    action=AuditLog.Action.LEAD_ASSIGNMENT,
                    field_name='assigned_to',
                    old_value=old_assignee,
                    new_value=target_caller.name,
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                caller_idx += 1
                updated_count += 1

            return Response({
                "message": f"Successfully round-robin assigned {updated_count} lead(s) across {num_callers} telecallers.",
                "assigned_count": updated_count
            })

        return Response({"error": "Must specify either telecaller_id or telecaller_ids."}, status=status.HTTP_400_BAD_REQUEST)
