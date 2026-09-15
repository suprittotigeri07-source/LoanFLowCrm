import uuid
from django.db import models


class Banker(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Bank or NBFC name")
    product_types = models.JSONField(default=list, help_text="e.g. ['Unsecured Business Loan', 'Working Capital']")
    min_turnover = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    min_vintage = models.DecimalField(max_digits=4, decimal_places=1, default=0, help_text="Min years in business")
    eligibility_rules = models.JSONField(
        default=dict,
        help_text="Configurable JSON rules e.g. {'min_cibil': 680, 'gst_required': true, 'max_existing_emi_ratio': 0.5}"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bankers'
        ordering = ['name']

    def __str__(self) -> str:
        return str(self.name)


class LeadBankerMatch(models.Model):
    objects = models.Manager()
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey('customers.Lead', on_delete=models.CASCADE, related_name='banker_matches')
    banker = models.ForeignKey(Banker, on_delete=models.CASCADE, related_name='matches')
    match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    selected = models.BooleanField(default=False)
    outcome = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lead_banker_matches'
        ordering = ['-match_score']

    def __str__(self):
        lead = getattr(self, 'lead', None)
        lead_name = getattr(lead, 'business_name', 'No Lead') if lead else 'No Lead'
        banker = getattr(self, 'banker', None)
        banker_name = getattr(banker, 'name', 'Unknown') if banker else 'Unknown'
        return f"{lead_name} <-> {banker_name} ({self.match_score}%)"
