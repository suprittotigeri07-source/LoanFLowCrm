from django.utils import timezone
from django.db.models import Count, Q, Sum
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdminOrASM
from customers.models import Lead
from calls.models import Call, FollowUp, CallOutcome


class TelecallerDashboardView(APIView):
    """
    Real-time KPI metrics for the logged-in telecaller:
    - Today's leads in queue
    - Today's follow-ups due & overdue count
    - Calls completed today
    - Conversions / Interested tally
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        # 1. Assigned leads
        assigned_leads = Lead.objects.filter(assigned_to=user)
        total_assigned = assigned_leads.count()

        # 2. Today's calling queue (New & Contacted)
        today_queue_count = assigned_leads.filter(
            status__in=[Lead.PipelineStage.NEW_LEAD, Lead.PipelineStage.CONTACTED]
        ).count()

        # 3. Calls made today
        today_calls = Call.objects.filter(
            telecaller=user,
            timestamp__gte=today_start,
            timestamp__lte=today_end
        )
        calls_today_count = today_calls.count()

        # Connected calls (duration > 0 and not busy/no response/wrong number)
        unconnected_outcomes = [
            CallOutcome.NO_RESPONSE,
            CallOutcome.NUMBER_BUSY,
            CallOutcome.WRONG_NUMBER
        ]
        connected_calls_count = today_calls.exclude(outcome__in=unconnected_outcomes).count()

        # 4. Follow-ups
        today_followups = FollowUp.objects.filter(
            assigned_to=user,
            due_at__gte=today_start,
            due_at__lte=today_end,
            completed=False
        ).count()

        overdue_followups = FollowUp.objects.filter(
            assigned_to=user,
            due_at__lt=now,
            completed=False
        ).count()

        # 5. Interested & in-pipeline
        interested_count = assigned_leads.filter(
            status__in=[
                Lead.PipelineStage.INTERESTED,
                Lead.PipelineStage.DOCUMENTS_PENDING,
                Lead.PipelineStage.LOGIN,
                Lead.PipelineStage.APPROVAL,
                Lead.PipelineStage.DISBURSEMENT
            ]
        ).count()

        return Response({
            "telecaller": {
                "id": str(user.id),
                "name": user.name,
                "territory": user.territory,
            },
            "metrics": {
                "total_assigned": total_assigned,
                "queue_remaining": today_queue_count,
                "calls_today": calls_today_count,
                "connected_today": connected_calls_count,
                "followups_due_today": today_followups,
                "followups_overdue": overdue_followups,
                "interested_leads": interested_count,
            }
        })


class AdminDashboardView(APIView):
    """
    High-level operational dashboard for Admin and ASM:
    - Pipeline funnel counts
    - Today's team calling metrics
    - Telecaller comparison table
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrASM]

    def get(self, request):
        user = request.user
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        lead_qs = Lead.objects.all()
        call_qs = Call.objects.all()
        caller_qs = User.objects.filter(role=User.Role.TELECALLER, is_active=True)

        # Territory scoping for ASM
        if isinstance(user, User) and user.role == User.Role.ASM and user.territory:
            lead_qs = lead_qs.filter(
                Q(customer__city__icontains=user.territory) |
                Q(assigned_to__territory__icontains=user.territory)
            )
            caller_qs = caller_qs.filter(territory__icontains=user.territory)
            call_qs = call_qs.filter(telecaller__territory__icontains=user.territory)

        # 1. Total Leads & Pipeline Funnel
        total_leads = lead_qs.count()
        unassigned_leads = lead_qs.filter(assigned_to__isnull=True).count()

        # Pipeline stages tally
        stages = [choice[0] for choice in Lead.PipelineStage.choices]
        stage_counts = {stage: 0 for stage in stages}
        for row in lead_qs.values('status').annotate(count=Count('id')):
            stage_counts[row['status']] = row['count']

        # 2. Today's Call Activity
        today_calls = call_qs.filter(timestamp__gte=today_start, timestamp__lte=today_end)
        total_calls_today = today_calls.count()

        unconnected_outcomes = [
            CallOutcome.NO_RESPONSE,
            CallOutcome.NUMBER_BUSY,
            CallOutcome.WRONG_NUMBER
        ]
        connected_calls_today = today_calls.exclude(outcome__in=unconnected_outcomes).count()
        interested_calls_today = today_calls.filter(outcome=CallOutcome.INTERESTED).count()

        # 3. Telecaller Performance Breakdown Table
        telecallers_data = []
        for caller in caller_qs:
            c_leads = Lead.objects.filter(assigned_to=caller)
            c_calls_today = Call.objects.filter(
                telecaller=caller,
                timestamp__gte=today_start,
                timestamp__lte=today_end
            )
            c_total_calls = c_calls_today.count()
            c_connected = c_calls_today.exclude(outcome__in=unconnected_outcomes).count()
            c_interested = c_leads.filter(
                status__in=[Lead.PipelineStage.INTERESTED, Lead.PipelineStage.DOCUMENTS_PENDING]
            ).count()
            c_pending_fu = FollowUp.objects.filter(assigned_to=caller, completed=False).count()

            telecallers_data.append({
                "id": str(caller.id),
                "name": caller.name,
                "territory": caller.territory or "General",
                "assigned_leads": c_leads.count(),
                "calls_today": c_total_calls,
                "connected_today": c_connected,
                "interested_leads": c_interested,
                "pending_followups": c_pending_fu,
            })

        return Response({
            "overview": {
                "total_leads": total_leads,
                "unassigned_leads": unassigned_leads,
                "calls_today": total_calls_today,
                "connected_today": connected_calls_today,
                "interested_today": interested_calls_today,
            },
            "pipeline_stages": stage_counts,
            "telecaller_performance": telecallers_data,
        })
