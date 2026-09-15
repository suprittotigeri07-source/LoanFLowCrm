from rest_framework import serializers
from .models import Customer, Lead
from accounts.serializers import UserSerializer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'mobile', 'alt_mobile', 'city', 'pincode', 'created_at']
        read_only_fields = ['id', 'created_at']


class LeadListSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'customer', 'business_name', 'business_type', 'vintage',
            'ownership_type', 'gst_available', 'itr_available', 'banking_available',
            'monthly_turnover', 'annual_turnover', 'existing_loans', 'existing_emi',
            'cibil_range', 'required_loan_amount', 'loan_type', 'lead_source',
            'status', 'assigned_to', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeadCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'business_name', 'business_type', 'vintage', 'ownership_type',
            'gst_available', 'itr_available', 'banking_available',
            'monthly_turnover', 'annual_turnover', 'existing_loans', 'existing_emi',
            'cibil_range', 'required_loan_amount', 'loan_type', 'lead_source',
            'status', 'assigned_to'
        ]


class LeadDetailSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    calls = serializers.SerializerMethodField()
    follow_ups = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            'id', 'customer', 'business_name', 'business_type', 'vintage',
            'ownership_type', 'gst_available', 'itr_available', 'banking_available',
            'monthly_turnover', 'annual_turnover', 'existing_loans', 'existing_emi',
            'cibil_range', 'required_loan_amount', 'loan_type', 'lead_source',
            'status', 'assigned_to', 'calls', 'follow_ups', 'documents',
            'created_at', 'updated_at'
        ]

    def get_calls(self, obj):
        return [
            {
                'id': str(call.id),
                'telecaller_name': call.telecaller.name,
                'timestamp': call.timestamp,
                'duration': call.duration,
                'outcome': call.outcome,
                'remarks': call.remarks,
                'recording_url': call.recording_url,
            }
            for call in obj.calls.all()[:15]
        ]

    def get_follow_ups(self, obj):
        return [
            {
                'id': str(fu.id),
                'due_at': fu.due_at,
                'completed': fu.completed,
                'remarks': fu.remarks,
                'assigned_to_name': fu.assigned_to.name,
            }
            for fu in obj.follow_ups.all()[:10]
        ]

    def get_documents(self, obj):
        return [
            {
                'id': str(doc.id),
                'type': doc.type,
                'status': doc.status,
                'file_url': doc.file_url,
            }
            for doc in obj.documents.all()
        ]
