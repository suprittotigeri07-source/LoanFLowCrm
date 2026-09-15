import uuid
from django.db import models


class WhatsAppMessage(models.Model):
    class Direction(models.TextChoices):
        OUTBOUND = 'OUTBOUND', 'Outbound'
        INBOUND = 'INBOUND', 'Inbound'

    class Status(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        SENT = 'SENT', 'Sent'
        DELIVERED = 'DELIVERED', 'Delivered'
        READ = 'READ', 'Read'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey('customers.Lead', on_delete=models.CASCADE, related_name='whatsapp_messages')
    template_used = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    direction = models.CharField(max_length=20, choices=Direction.choices, default=Direction.OUTBOUND)
    content = models.TextField()
    external_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'whatsapp_messages'
        ordering = ['-created_at']

    def __str__(self):
        lead = getattr(self, 'lead', None)
        lead_name = getattr(lead, 'business_name', 'No Lead') if lead else 'No Lead'
        return f"WhatsApp ({self.direction}) - {lead_name} [{self.status}]"
