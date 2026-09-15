import os
import sys
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')

import django
django.setup()

from accounts.models import User
from customers.models import Customer, Lead
from calls.models import Call, FollowUp
from documents.models import Document
from audit.models import AuditLog
from communications.models import WhatsAppMessage


def reset_and_seed():
    print("Initializing Fresh LoanFlow CRM Database...")

    # 1. Clean all operational data
    print("Purging sample/demo data...")
    WhatsAppMessage.objects.all().delete()
    AuditLog.objects.all().delete()
    Document.objects.all().delete()
    FollowUp.objects.all().delete()
    Call.objects.all().delete()
    Lead.objects.all().delete()
    Customer.objects.all().delete()

    # Delete all non-admin users
    non_admin_deleted, _ = User.objects.filter(role__in=[User.Role.ASM, User.Role.TELECALLER]).delete()
    print(f"Removed {non_admin_deleted} demo/non-admin users.")

    # 2. Seed initial Admin account
    admin, created = User.objects.get_or_create(
        email='admin@crm.local',
        defaults={
            'employee_id': 'ADMIN-001',
            'name': 'Super Admin',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    if not admin.employee_id:
        admin.employee_id = 'ADMIN-001'
    admin.role = User.Role.ADMIN
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.set_password('Admin@12345')
    admin.save()

    print(f"Fresh Admin Ready: {admin.email} (Emp ID: {admin.employee_id})")
    print("Fresh LoanFlow CRM Database Ready! All demo business data removed.")


if __name__ == '__main__':
    reset_and_seed()
