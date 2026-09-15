import uuid
from django.db import models
from django.conf import settings


class CallOutcome(models.TextChoices):
    INTERESTED = 'Interested', 'Interested'
    NOT_INTERESTED = 'Not Interested', 'Not Interested'
    CALL_LATER = 'Call Later', 'Call Later'
    NUMBER_BUSY = 'Number Busy', 'Number Busy'
    NO_RESPONSE = 'No Response', 'No Response'
    WRONG_NUMBER = 'Wrong Number', 'Wrong Number'
    ALREADY_TAKEN_LOAN = 'Already Taken Loan', 'Already Taken Loan'
    LOAN_REQUIRED_DOCS_PENDING = 'Loan Required – Documents Pending', 'Loan Required – Documents Pending'
    ELIGIBLE_SEND_DOCS = 'Eligible – Send Documents', 'Eligible – Send Documents'
    NOT_ELIGIBLE = 'Not Eligible', 'Not Eligible'


class Call(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey('customers.Lead', on_delete=models.CASCADE, related_name='calls')
    telecaller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='calls')
    timestamp = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(default=0, help_text="Duration in seconds")
    outcome = models.CharField(max_length=60, choices=CallOutcome.choices)
    recording_url = models.URLField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    external_call_id = models.CharField(max_length=100, blank=True, null=True, help_text="Telephony provider call SID")

    class Meta:
        db_table = 'calls'
        ordering = ['-timestamp']

    def __str__(self):
        lead = getattr(self, 'lead', None)
        lead_name = getattr(lead, 'business_name', 'No Lead') if lead else 'No Lead'

        telecaller = getattr(self, 'telecaller', None)
        telecaller_name = getattr(telecaller, 'name', 'Unknown') if telecaller else 'Unknown'

        return f"{lead_name} - {self.outcome} by {telecaller_name}"


class FollowUp(models.Model):
    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey('customers.Lead', on_delete=models.CASCADE, related_name='follow_ups')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='follow_ups')
    due_at = models.DateTimeField()
    completed = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'follow_ups'
        ordering = ['due_at']

    def __str__(self):
        status = "Completed" if self.completed else "Pending"
        lead = getattr(self, 'lead', None)
        lead_name = getattr(lead, 'business_name', 'No Lead') if lead else 'No Lead'
        due_at = getattr(self, 'due_at', None)
        if hasattr(due_at, 'strftime'):
            due_str = due_at.strftime('%Y-%m-%d %H:%M')
        elif due_at is not None:
            due_str = str(due_at)
        else:
            due_str = 'Unscheduled'
        return f"Follow-up for {lead_name} at {due_str} ({status})"


class VoiceNote(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        TRANSCRIBED = 'TRANSCRIBED', 'Transcribed'
        FAILED = 'FAILED', 'Failed'

    objects = models.Manager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    call = models.ForeignKey(Call, on_delete=models.CASCADE, related_name='voice_notes')
    audio_url = models.URLField()
    transcribed_text = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'voice_notes'
        ordering = ['-created_at']

    def __str__(self):
        return f"VoiceNote for Call {self.call_id} ({self.status})"
