import pytest
from decimal import Decimal
from rest_framework.test import APIClient

from accounts.models import User
from customers.models import Customer, Lead


@pytest.mark.django_db
class TestRBACIsolation:
    def setup_method(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@corp.local',
            name='Admin User',
            role=User.Role.ADMIN,
            password='Password@123'
        )
        self.caller_a = User.objects.create_user(
            email='caller_a@corp.local',
            name='Telecaller A',
            role=User.Role.TELECALLER,
            password='Password@123'
        )
        self.caller_b = User.objects.create_user(
            email='caller_b@corp.local',
            name='Telecaller B',
            role=User.Role.TELECALLER,
            password='Password@123'
        )

        c1 = Customer.objects.create(name='Customer A', mobile='9111111111')
        c2 = Customer.objects.create(name='Customer B', mobile='9222222222')

        self.lead_a = Lead.objects.create(
            customer=c1,
            business_name='Enterprise A',
            required_loan_amount=Decimal('500000.00'),
            assigned_to=self.caller_a
        )
        self.lead_b = Lead.objects.create(
            customer=c2,
            business_name='Enterprise B',
            required_loan_amount=Decimal('800000.00'),
            assigned_to=self.caller_b
        )

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.get('/api/leads/')
        assert response.status_code == 401

    def test_telecaller_list_view_only_returns_own_leads(self):
        self.client.force_authenticate(user=self.caller_a)
        response = self.client.get('/api/leads/')
        assert response.status_code == 200
        # Results may be paginated:
        results = response.data.get('results', response.data)
        lead_ids = [item['id'] for item in results]
        assert str(self.lead_a.id) in lead_ids
        # Caller B's lead must NOT be present
        assert str(self.lead_b.id) not in lead_ids

    def test_telecaller_cannot_fetch_another_callers_lead_detail(self):
        self.client.force_authenticate(user=self.caller_a)
        # Attempting direct access to lead_b
        response = self.client.get(f'/api/leads/{self.lead_b.id}/')
        # Server-side queryset isolation returns 404 or 403
        assert response.status_code in [403, 404]

    def test_admin_can_access_all_leads(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/leads/')
        assert response.status_code == 200
        results = response.data.get('results', response.data)
        lead_ids = [item['id'] for item in results]
        assert str(self.lead_a.id) in lead_ids
        assert str(self.lead_b.id) in lead_ids
