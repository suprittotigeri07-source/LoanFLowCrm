"""Accounts application configuration."""
from django.apps import AppConfig
from django.db.models.signals import post_migrate


def ensure_super_admin(sender=None, **kwargs):
    """Automatically seed/ensure Super Admin account exists in production & dev DB."""
    try:
        from .models import User
        admin = User.objects.filter(email='suprittotiger05@gmail.com').first()
        if not admin:
            admin = User.objects.filter(role=User.Role.ADMIN).first()

        if not admin:
            admin = User(
                email='suprittotiger05@gmail.com',
                employee_id='ADMIN-001',
                name='Super Admin',
                role=User.Role.ADMIN,
                is_staff=True,
                is_superuser=True,
                is_active=True,
            )
        else:
            admin.email = 'suprittotiger05@gmail.com'
            admin.employee_id = 'ADMIN-001'
            admin.role = User.Role.ADMIN
            admin.is_staff = True
            admin.is_superuser = True
            admin.is_active = True

        admin.set_password('Suprit05#@')
        admin.save()
    except Exception as e:
        # Prevent failure during initial unmigrated setup
        pass


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        post_migrate.connect(ensure_super_admin, sender=self)

