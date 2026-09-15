import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        ASM = 'ASM', 'Area Sales Manager'
        TELECALLER = 'TELECALLER', 'Telecaller'

    class EmailStatus(models.TextChoices):
        SENT = 'Credentials Sent', 'Credentials Sent'
        FAILED = 'Email Failed', 'Email Failed'
        NOT_SENT = 'Not Sent', 'Not Sent'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # type: ignore[assignment]
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Unique Employee ID (e.g. ADMIN-001, ASM-001, TC-001)")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TELECALLER)
    branch = models.CharField(max_length=100, blank=True, null=True, help_text="Branch or location")
    territory = models.CharField(max_length=100, blank=True, null=True, help_text="Territory coverage")
    joining_date = models.DateField(blank=True, null=True)
    asm = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='team_telecallers', help_text="Assigned Reporting Manager / ASM")
    must_change_password = models.BooleanField(default=False, help_text="Flag requiring password change on next login")
    credentials_email_status = models.CharField(max_length=30, choices=EmailStatus.choices, default=EmailStatus.NOT_SENT)
    is_deleted = models.BooleanField(default=False, help_text="Soft deletion flag to preserve historical records")
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.employee_id or self.email}) - {self.get_role_display()}"
