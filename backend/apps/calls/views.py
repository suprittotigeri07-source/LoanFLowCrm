from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.models import User
from customers.models import Lead
from audit.models import AuditLog
from .models import Call, FollowUp, CallOutcome
from .serializers import CallSerializer, FollowUpSerializer, DispositionInputSerializer


class CallDispositionView(APIView):
    """
    Core Telecalling Disposition Workflow:
    1. Validates outcome (one of 10 choices)
    2. Saves Call log
    3. Updates Lead pipeline stage automatically based on outcome
    4. Optionally creates a scheduled FollowUp record
    5. Writes an immutable audit log
    6. Identifies the next lead in the caller's queue for seamless auto-advance
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DispositionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        lead_id = data['lead_id']
        outcome = data['outcome']
        duration = data.get('duration', 0)
        remarks = data.get('remarks', '')
        fu_due_at = data.get('follow_up_due_at')
        fu_remarks = data.get('follow_up_remarks', '')

        try:
            lead = Lead.objects.select_related('customer', 'assigned_to').get(id=lead_id)
        except ObjectDoesNotExist:
            return Response({"error": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

        # Enforce that telecallers can only dispose their own leads
        if isinstance(request.user, User) and request.user.role == User.Role.TELECALLER and lead.assigned_to != request.user:
            return Response(
                {"error": "Permission denied: You can only log dispositions for leads assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )

        with transaction.atomic():
            # 1. Create Call log
            call = Call.objects.create(
                lead=lead,
                telecaller=request.user,
                duration=duration,
                outcome=outcome,
                remarks=remarks
            )

            # 2. Determine pipeline status transition
            old_status = lead.status
            new_status = old_status

            if outcome == CallOutcome.INTERESTED:
                new_status = Lead.PipelineStage.INTERESTED
            elif outcome in [CallOutcome.ELIGIBLE_SEND_DOCS, CallOutcome.LOAN_REQUIRED_DOCS_PENDING]:
                new_status = Lead.PipelineStage.DOCUMENTS_PENDING
            elif old_status == Lead.PipelineStage.NEW_LEAD:
                new_status = Lead.PipelineStage.CONTACTED

            if new_status != old_status:
                lead.status = new_status
                lead.save(update_fields=['status', 'updated_at'])

                AuditLog.objects.create(
                    user=request.user,
                    lead=lead,
                    action=AuditLog.Action.STATUS_CHANGE,
                    field_name='status',
                    old_value=old_status,
                    new_value=new_status,
                    ip_address=request.META.get('REMOTE_ADDR')
                )

            # 3. Create FollowUp if requested
            follow_up_instance = None
            if fu_due_at:
                follow_up_instance = FollowUp.objects.create(
                    lead=lead,
                    assigned_to=request.user,
                    due_at=fu_due_at,
                    remarks=fu_remarks or f"Follow-up scheduled after {outcome}"
                )
                AuditLog.objects.create(
                    user=request.user,
                    lead=lead,
                    action=AuditLog.Action.FOLLOW_UP_CREATED,
                    field_name='follow_up',
                    old_value=None,
                    new_value=f"Due at {fu_due_at.strftime('%Y-%m-%d %H:%M')}" if hasattr(fu_due_at, 'strftime') else f"Due at {fu_due_at}",
                    ip_address=request.META.get('REMOTE_ADDR')
                )

            # 4. Audit disposition
            AuditLog.objects.create(
                user=request.user,
                lead=lead,
                action=AuditLog.Action.DISPOSITION_LOGGED,
                field_name='outcome',
                old_value=None,
                new_value=f"Outcome: {outcome} (Duration: {duration}s)",
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # 5. Fetch next lead in telecaller queue (auto-advance)
            next_lead = Lead.objects.filter(
                assigned_to=request.user,
                status__in=[Lead.PipelineStage.NEW_LEAD, Lead.PipelineStage.CONTACTED]
            ).exclude(id=lead.id).order_by('created_at').first()

            return Response({
                "message": "Disposition logged successfully",
                "call_id": str(call.id),
                "lead_id": str(lead.id),
                "new_status": lead.status,
                "follow_up_id": str(follow_up_instance.id) if follow_up_instance else None,
                "next_lead_id": str(next_lead.id) if next_lead else None,
            }, status=status.HTTP_201_CREATED)


class TodayFollowUpsView(APIView):
    """
    Surfaces today's due follow-ups sorted by time:
    - Telecaller: sees only their assigned follow-ups
    - ASM: sees follow-ups for telecallers in their territory
    - Admin: sees all follow-ups
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        user = request.user
        qs = FollowUp.objects.filter(
            due_at__gte=today_start,
            due_at__lte=today_end,
            completed=False
        ).select_related('lead', 'lead__customer', 'assigned_to')

        if isinstance(user, User) and user.role == User.Role.TELECALLER:
            qs = qs.filter(assigned_to=user)
        elif isinstance(user, User) and user.role == User.Role.ASM and user.territory:
            qs = qs.filter(assigned_to__territory__icontains=user.territory)

        qs = qs.order_by('due_at')
        serializer = FollowUpSerializer(qs, many=True)
        return Response({
            "count": qs.count(),
            "follow_ups": serializer.data
        })


class OverdueFollowUpsView(APIView):
    """
    Surfaces overdue follow-ups (due_at < now and completed == False):
    - Telecaller sees their own overdue follow-ups
    - ASM & Admin see overdue follow-ups to follow up with telecallers
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        user = request.user

        qs = FollowUp.objects.filter(
            due_at__lt=now,
            completed=False
        ).select_related('lead', 'lead__customer', 'assigned_to')

        if isinstance(user, User) and user.role == User.Role.TELECALLER:
            qs = qs.filter(assigned_to=user)
        elif isinstance(user, User) and user.role == User.Role.ASM and user.territory:
            qs = qs.filter(assigned_to__territory__icontains=user.territory)

        qs = qs.order_by('due_at')
        serializer = FollowUpSerializer(qs, many=True)
        return Response({
            "count": qs.count(),
            "overdue_follow_ups": serializer.data
        })


class CompleteFollowUpView(APIView):
    """Mark a follow-up as completed."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            fu = FollowUp.objects.get(id=pk)
        except FollowUp.DoesNotExist:
            return Response({"error": "Follow-up not found."}, status=status.HTTP_404_NOT_FOUND)

        if isinstance(request.user, User) and request.user.role == User.Role.TELECALLER and fu.assigned_to != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        fu.completed = True
        fu.completed_at = timezone.now()
        fu.save(update_fields=['completed', 'completed_at'])
        return Response({"message": "Follow-up marked as completed."})
