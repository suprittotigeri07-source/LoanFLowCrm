import uuid
import hashlib
from django.db import models
from django.conf import settings


def hash_mobile(mobile_number: str) -> str:
    """Returns SHA256 hex digest of normalized 10-digit mobile number."""
    if not mobile_number:
        return ""
    # Strip spaces, dashes, +91, 0 prefix
    cleaned = "".join(filter(str.isdigit, str(mobile_number)))
    if len(cleaned) > 10:
        cleaned = cleaned[-10:]
    return hashlib.sha256(cleaned.encode('utf-8')).hexdigest()


class Customer(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)
    mobile_hash = models.CharField(max_length=64, db_index=True)
    alt_mobile = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customers'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.mobile_hash:
            self.mobile_hash = hash_mobile(self.mobile)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.mobile})"


class Lead(models.Model):
    class PipelineStage(models.TextChoices):
        NEW_LEAD = 'New Lead', 'New Lead'
        CONTACTED = 'Contacted', 'Contacted'
        INTERESTED = 'Interested', 'Interested'
        ELIGIBILITY_CHECK = 'Eligibility Check', 'Eligibility Check'
        DOCUMENTS_PENDING = 'Documents Pending', 'Documents Pending'
        LOGIN = 'Login', 'Login'
        CREDIT_PD = 'Credit/PD', 'Credit/PD'
        APPROVAL = 'Approval', 'Approval'
        DISBURSEMENT = 'Disbursement', 'Disbursement'

    class LoanType(models.TextChoices):
        BUSINESS = 'Business Loan', 'Business Loan'
        WORKING_CAPITAL = 'Working Capital', 'Working Capital'
        EXPANSION = 'Expansion', 'Expansion'
        MACHINERY = 'Machinery', 'Machinery'
        BALANCE_TRANSFER = 'Balance Transfer', 'Balance Transfer'
        DEBT_CONSOLIDATION = 'Debt Consolidation', 'Debt Consolidation'
        OTHER = 'Other', 'Other'

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='leads')
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=100, blank=True, null=True)
    vintage = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="Years in business")
    ownership_type = models.CharField(max_length=50, blank=True, null=True)
    gst_available = models.BooleanField(default=False)
    itr_available = models.BooleanField(default=False)
    banking_available = models.BooleanField(default=False)
    monthly_turnover = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    annual_turnover = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    existing_loans = models.BooleanField(default=False)
    existing_emi = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cibil_range = models.CharField(max_length=50, blank=True, null=True)
    required_loan_amount = models.DecimalField(max_digits=14, decimal_places=2)
    loan_type = models.CharField(max_length=50, choices=LoanType.choices, default=LoanType.BUSINESS)
    lead_source = models.CharField(max_length=100, default='CSV Upload')
    status = models.CharField(max_length=50, choices=PipelineStage.choices, default=PipelineStage.NEW_LEAD)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leads'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.business_name} - {self.customer.name} (₹{self.required_loan_amount:,.0f})"
