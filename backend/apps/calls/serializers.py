from rest_framework import serializers
from .models import Call, FollowUp, VoiceNote, CallOutcome
from customers.serializers import LeadListSerializer
from accounts.serializers import UserSerializer


class CallSerializer(serializers.ModelSerializer):
    telecaller = UserSerializer(read_only=True)

    class Meta:
        model = Call
        fields = [
            'id', 'lead', 'telecaller', 'timestamp', 'duration',
            'outcome', 'recording_url', 'remarks', 'external_call_id'
        ]
        read_only_fields = ['id', 'timestamp', 'telecaller']


class FollowUpSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    lead_business_name = serializers.CharField(source='lead.business_name', read_only=True)
    customer_name = serializers.CharField(source='lead.customer.name', read_only=True)
    customer_mobile = serializers.CharField(source='lead.customer.mobile', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = FollowUp
        fields = [
            'id', 'lead', 'lead_business_name', 'customer_name', 'customer_mobile',
            'assigned_to', 'due_at', 'completed', 'remarks', 'completed_at',
            'created_at', 'is_overdue'
        ]
        read_only_fields = ['id', 'created_at', 'assigned_to']

    def get_is_overdue(self, obj):
        from django.utils import timezone
        return not obj.completed and obj.due_at < timezone.now()


class DispositionInputSerializer(serializers.Serializer):
    lead_id = serializers.UUIDField()
    duration = serializers.IntegerField(default=0, min_value=0)
    outcome = serializers.ChoiceField(choices=CallOutcome.choices)
    remarks = serializers.CharField(required=False, allow_blank=True, default="")
    follow_up_due_at = serializers.DateTimeField(required=False, allow_null=True)
    follow_up_remarks = serializers.CharField(required=False, allow_blank=True, default="")
