from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.scholarships.models import Scholarship
import secrets

User = get_user_model()

CHALLAN_AMOUNT = 2000  # PKR — fixed processing fee


def _generate_challan_number():
    """Generate a unique challan reference: SB-YYYY-XXXXXXXXXXXXXXXX"""
    year = timezone.now().year
    rand = secrets.token_hex(8)
    return f"SB-{year}-{rand}"


def challan_upload_path(instance, filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return f"challans/{instance.challan_number}.{ext}"


class Application(models.Model):
    """A student's scholarship application with challan payment workflow."""

    # ── Status choices ────────────────────────────────────────────────
    STATUS_PENDING          = 'pending'           # submitted, awaiting challan payment
    STATUS_CHALLAN_PAID     = 'challan_paid'      # student uploaded signed challan
    STATUS_APPROVED         = 'approved'          # admin verified & approved
    STATUS_REJECTED         = 'rejected'          # admin rejected
    STATUS_CANCELLED        = 'cancelled'         # student cancelled
    STATUS_EXPIRED          = 'expired'           # challan deadline passed — auto-removed

    STATUS_CHOICES = [
        (STATUS_PENDING,       'Pending — Challan Due'),
        (STATUS_CHALLAN_PAID,  'Challan Uploaded — Awaiting Review'),
        (STATUS_APPROVED,      'Approved'),
        (STATUS_REJECTED,      'Rejected'),
        (STATUS_CANCELLED,     'Cancelled'),
        (STATUS_EXPIRED,       'Expired'),
    ]

    student    = models.ForeignKey(User,        on_delete=models.CASCADE, related_name='applications')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE, related_name='applications')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)

    # ── Academic snapshot at time of application ──────────────────────
    applied_cgpa       = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    applied_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    applied_ielts      = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    scholarship_tier   = models.IntegerField(default=0)

    # ── Application content ───────────────────────────────────────────
    personal_statement = models.TextField(blank=True)
    admin_notes        = models.TextField(blank=True)

    # ── Challan fields ────────────────────────────────────────────────
    challan_number   = models.CharField(max_length=30, unique=True, blank=True)
    challan_amount   = models.IntegerField(default=CHALLAN_AMOUNT)  # PKR
    challan_due_date = models.DateTimeField(null=True, blank=True)  # 20 days from applied_at
    challan_paid_at  = models.DateTimeField(null=True, blank=True)
    challan_image    = models.ImageField(
        upload_to=challan_upload_path,
        null=True, blank=True,
        help_text="Signed/stamped challan receipt uploaded by student"
    )

    # ── Timestamps ────────────────────────────────────────────────────
    applied_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ['student', 'scholarship']

    def __str__(self):
        return f"{self.student.email} → {self.scholarship.title} [{self.status}]"

    # ── Computed properties ───────────────────────────────────────────
    @property
    def is_challan_overdue(self):
        if self.challan_due_date and self.status == self.STATUS_PENDING:
            return timezone.now() > self.challan_due_date
        return False

    @property
    def challan_days_remaining(self):
        if not self.challan_due_date:
            return None
        delta = self.challan_due_date - timezone.now()
        return max(0, delta.days)

    # ── Save hook ─────────────────────────────────────────────────────
    def save(self, *args, **kwargs):
        is_new = not self.pk

        if is_new:
            # Generate unique challan number
            cn = _generate_challan_number()
            while Application.objects.filter(challan_number=cn).exists():
                cn = _generate_challan_number()
            self.challan_number = cn

            # Challan deadline = 20 days from now
            self.challan_due_date = timezone.now() + timedelta(days=20)

            # Snapshot academic info
            try:
                profile = self.student.student_profile
                self.applied_cgpa       = profile.cgpa
                self.applied_percentage = profile.percentage
                self.applied_ielts      = profile.ielts_score
                if profile.percentage:
                    eligible, tier, _ = self.scholarship.get_scholarship_tier(profile.percentage)
                    self.scholarship_tier = tier if eligible else 0
            except Exception:
                pass

        super().save(*args, **kwargs)
