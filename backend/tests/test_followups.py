import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

from accounts.models import User
from customers.models import Customer, Lead
from calls.models import FollowUp


@pytest.mark.django_db
class TestFollowUpEngine:
    def setup_method(self):
        self.client = APIClient()
        self.caller1 = User.objects.create_user(
            email='c1@test.local',
            name='Caller One',
            role=User.Role.TELECALLER,
            password='Password@123'
        )
        self.caller2 = User.objects.create_user(
            email='c2@test.local',
            name='Caller Two',
            role=User.Role.TELECALLER,
            password='Password@123'
        )

        customer = Customer.objects.create(name='Test Cust', mobile='9876543210')
        self.lead = Lead.objects.create(
            customer=customer,
            business_name='Omega Trading',
            required_loan_amount=Decimal('1000000.00'),
            assigned_to=self.caller1
        )

        now = timezone.now()
        # Today's pending follow up
        self.fu_today = FollowUp.objects.create(
            lead=self.lead,
            assigned_to=self.caller1,
            due_at=now.replace(hour=14, minute=0, second=0),
            remarks="Call today 2 PM"
        )
        # Overdue follow up (due yesterday)
        self.fu_overdue = FollowUp.objects.create(
            lead=self.lead,
            assigned_to=self.caller1,
            due_at=now - timedelta(days=1),
            remarks="Urgent callback"
        )
        # Caller 2's follow up
        self.fu_caller2 = FollowUp.objects.create(
            lead=self.lead,
            assigned_to=self.caller2,
            due_at=now.replace(hour=16, minute=0, second=0),
            remarks="Caller 2 task"
        )

    def test_today_followups_isolated_to_caller(self):
        self.client.force_authenticate(user=self.caller1)
        response = self.client.get('/api/follow-ups/today/')
        assert response.status_code == 200
        fu_ids = [item['id'] for item in response.data['follow_ups']]
        assert str(self.fu_today.id) in fu_ids
        # Caller 2's follow up must not leak
        assert str(self.fu_caller2.id) not in fu_ids

    def test_overdue_followups_surfaced(self):
        self.client.force_authenticate(user=self.caller1)
        response = self.client.get('/api/follow-ups/overdue/')
        assert response.status_code == 200
        overdue_ids = [item['id'] for item in response.data['overdue_follow_ups']]
        assert str(self.fu_overdue.id) in overdue_ids

    def test_complete_followup(self):
        self.client.force_authenticate(user=self.caller1)
        url = f'/api/follow-ups/{self.fu_today.id}/complete/'
        response = self.client.patch(url)
        assert response.status_code == 200

        self.fu_today.refresh_from_db()
        assert self.fu_today.completed is True
        assert self.fu_today.completed_at is not None

    def test_str_representation_safety(self):
        from calls.models import Call
        call = Call(outcome="Interested")
        assert "No Lead" in str(call)
        assert "Unknown" in str(call)

        follow_up = FollowUp(due_at=timezone.now())
        assert "No Lead" in str(follow_up)

