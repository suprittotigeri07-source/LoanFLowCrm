import pytest
import io
from decimal import Decimal
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from accounts.models import User
from customers.models import Customer, Lead


@pytest.mark.django_db
class TestLeadUploadAndAssignment:
    def setup_method(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@corp.local',
            name='Admin User',
            role=User.Role.ADMIN,
            password='Password@123'
        )
        self.caller = User.objects.create_user(
            email='caller@corp.local',
            name='Telecaller One',
            role=User.Role.TELECALLER,
            password='Password@123'
        )

        # Existing customer to test duplicate mobile detection
        self.existing_customer = Customer.objects.create(
            name='Existing Owner',
            mobile='9820000000',
            city='Mumbai'
        )

    def test_csv_upload_valid_and_duplicate_handling(self):
        self.client.force_authenticate(user=self.admin)

        # CSV containing 1 duplicate mobile and 1 fresh mobile
        csv_content = (
            "name,mobile,city,business_name,required_loan_amount,monthly_turnover,vintage,gst_available\n"
            "Existing Owner,9820000000,Mumbai,Old Shop,1000000,200000,3,yes\n"
            "Fresh Owner,9830000001,Kolkata,Fresh Trading,2500000,500000,4,yes\n"
        )
        file = SimpleUploadedFile("leads.csv", csv_content.encode('utf-8'), content_type="text/csv")

        response = self.client.post('/api/leads/upload-csv/', {'file': file}, format='multipart')
        assert response.status_code == 201
        assert response.data['total_rows'] == 2
        assert response.data['created_count'] == 1
        assert response.data['duplicate_count'] == 1
        assert len(response.data['duplicates_flagged']) == 1
        assert response.data['duplicates_flagged'][0]['mobile'] == '9820000000'

        # Verify Fresh Customer & Lead were created
        assert Customer.objects.filter(mobile='9830000001').exists()
        assert Lead.objects.filter(business_name='Fresh Trading').exists()

    def test_lead_assignment(self):
        self.client.force_authenticate(user=self.admin)
        customer = Customer.objects.create(name='Unassigned Cust', mobile='9899999999')
        lead = Lead.objects.create(
            customer=customer,
            business_name='Unassigned Corp',
            required_loan_amount=Decimal('1200000.00'),
            assigned_to=None
        )

        url = '/api/leads/assign/'
        payload = {
            'lead_ids': [str(lead.id)],
            'telecaller_id': str(self.caller.id)
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == 200

        lead.refresh_from_db()
        assert lead.assigned_to == self.caller
