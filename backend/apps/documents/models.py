import uuid
from django.db import models
from django.conf import settings


class Document(models.Model):
    class DocType(models.TextChoices):
        PAN_CARD = 'PAN Card', 'PAN Card'
        AADHAAR = 'Aadhaar Card', 'Aadhaar Card'
        GST_CERTIFICATE = 'GST Certificate', 'GST Certificate'
        BANK_STATEMENT = 'Bank Statement', '12 Months Bank Statement'
        ITR = 'ITR', '2 Years ITR with Computation'
        BUSINESS_REGISTRATION = 'Business Registration', 'Business Registration Proof'
        SANCTION_LETTER = 'Sanction Letter', 'Existing Loan Sanction Letter'
        OTHER = 'Other', 'Other Document'

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        UPLOADED = 'Uploaded', 'Uploaded'
        VERIFIED = 'Verified', 'Verified'
        REJECTED = 'Rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey('customers.Lead', on_delete=models.CASCADE, related_name='documents')
    type = models.CharField(max_length=60, choices=DocType.choices)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    file_url = models.URLField(blank=True, null=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-created_at']

    def __str__(self):
        lead = getattr(self, 'lead', None)
        lead_name = getattr(lead, 'business_name', 'No Lead') if lead else 'No Lead'
        return f"{self.type} - {lead_name} ({self.status})"
