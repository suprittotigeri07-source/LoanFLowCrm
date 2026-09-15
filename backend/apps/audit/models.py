import uuid
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    class Action(models.TextChoices):
        STATUS_CHANGE = 'STATUS_CHANGE', 'Pipeline Status Change'
        VIEW_SENSITIVE = 'VIEW_SENSITIVE', 'Viewed Sensitive Data'
        FINANCIAL_UPDATE = 'FINANCIAL_UPDATE', 'Updated Financial Details'
        LEAD_ASSIGNMENT = 'LEAD_ASSIGNMENT', 'Lead Assignment'
        DISPOSITION_LOGGED = 'DISPOSITION_LOGGED', 'Call Disposition Logged'
        FOLLOW_UP_CREATED = 'FOLLOW_UP_CREATED', 'Follow-up Created'
        DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED', 'Document Uploaded'

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    lead = models.ForeignKey(
        'customers.Lead',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=Action.choices)
    field_name = models.CharField(max_length=100, blank=True, null=True)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        user_str = self.user.name if self.user else "System"
        return f"[{self.action}] by {user_str} at {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
