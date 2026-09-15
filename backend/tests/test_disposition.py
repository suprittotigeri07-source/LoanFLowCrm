import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from accounts.models import User
from customers.models import Customer, Lead, hash_mobile
from calls.models import Call, FollowUp, CallOutcome


@pytest.mark.django_db
class TestCallDisposition:
    def setup_method(self):
        self.client = APIClient()
        self.caller1 = User.objects.create_user(
            email='caller1@test.local',
            name='Caller 1',
            role=User.Role.TELECALLER,
            password='Password@123'
        )
        self.caller2 = User.objects.create_user(
            email='caller2@test.local',
            name='Caller 2',
            role=User.Role.TELECALLER,
            password='Password@123'
        )

        self.customer = Customer.objects.create(
            name='Test Business Owner',
            mobile='9999911111',
            city='Delhi'
        )
        self.lead1 = Lead.objects.create(
            customer=self.customer,
            business_name='Alpha Enterprises',
            required_loan_amount=Decimal('1500000.00'),
            status=Lead.PipelineStage.NEW_LEAD,
            assigned_to=self.caller1
        )
        self.lead2 = Lead.objects.create(
            customer=self.customer,
            business_name='Beta Retail',
            required_loan_amount=Decimal('2000000.00'),
            status=Lead.PipelineStage.NEW_LEAD,
            assigned_to=self.caller1
        )

    def test_disposition_interested_updates_pipeline_stage(self):
        self.client.force_authenticate(user=self.caller1)
        url = '/api/calls/disposition/'
        payload = {
            'lead_id': str(self.lead1.id),
            'duration': 145,
            'outcome': CallOutcome.INTERESTED,
            'remarks': 'Customer agreed to proceed with proposal'
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == 201

        # Verify call record created
        call = Call.objects.get(id=response.data['call_id'])
        assert call.outcome == CallOutcome.INTERESTED
        assert call.duration == 145
        assert call.telecaller == self.caller1

        # Verify lead status advanced to Interested
        self.lead1.refresh_from_db()
        assert self.lead1.status == Lead.PipelineStage.INTERESTED

        # Verify auto-advance points to next lead
        assert response.data['next_lead_id'] == str(self.lead2.id)

    def test_disposition_with_followup_scheduling(self):
        self.client.force_authenticate(user=self.caller1)
        url = '/api/calls/disposition/'
        due_time = (timezone.now() + timedelta(days=1)).isoformat()

        payload = {
            'lead_id': str(self.lead1.id),
            'duration': 45,
            'outcome': CallOutcome.CALL_LATER,
            'remarks': 'Customer in meeting, call tomorrow',
            'follow_up_due_at': due_time,
            'follow_up_remarks': 'Follow up on loan requirement'
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == 201
        assert response.data['follow_up_id'] is not None

        # Verify FollowUp record created
        fu = FollowUp.objects.get(id=response.data['follow_up_id'])
        assert fu.assigned_to == self.caller1
        assert fu.completed is False
        assert fu.remarks == 'Follow up on loan requirement'

    def test_disposition_docs_pending_updates_pipeline_stage(self):
        self.client.force_authenticate(user=self.caller1)
        url = '/api/calls/disposition/'
        payload = {
            'lead_id': str(self.lead1.id),
            'duration': 210,
            'outcome': CallOutcome.LOAN_REQUIRED_DOCS_PENDING,
            'remarks': 'Customer requested checklist of documents'
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == 201

        self.lead1.refresh_from_db()
        assert self.lead1.status == Lead.PipelineStage.DOCUMENTS_PENDING

    def test_telecaller_cannot_dispose_other_telecallers_lead(self):
        # Caller 2 attempts to dispose Caller 1's lead
        self.client.force_authenticate(user=self.caller2)
        url = '/api/calls/disposition/'
        payload = {
            'lead_id': str(self.lead1.id),
            'duration': 30,
            'outcome': CallOutcome.INTERESTED,
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == 403
