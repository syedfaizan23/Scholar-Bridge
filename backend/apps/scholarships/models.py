from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Scholarship(models.Model):
    """Main scholarship model."""
    DEGREE_CHOICES = [
        ('bachelor', "Bachelor's"),
        ('master', "Master's"),
        ('phd', 'PhD'),
        ('any', 'Any Level'),
    ]

    COUNTRY_CHOICES = [
        ('USA', 'United States'),
        ('Canada', 'Canada'),
        ('Germany', 'Germany'),
        ('France', 'France'),
        ('Italy', 'Italy'),
        ('Netherlands', 'Netherlands'),
        ('Sweden', 'Sweden'),
        ('Norway', 'Norway'),
        ('Finland', 'Finland'),
        ('Switzerland', 'Switzerland'),
        ('Austria', 'Austria'),
        ('Belgium', 'Belgium'),
        ('Denmark', 'Denmark'),
        ('Ireland', 'Ireland'),
        ('UK', 'United Kingdom'),
        ('Other', 'Other European'),
    ]

    title = models.CharField(max_length=255)
    university_name = models.CharField(max_length=255)
    country = models.CharField(max_length=50, choices=COUNTRY_CHOICES, db_index=True)
    degree_level = models.CharField(max_length=20, choices=DEGREE_CHOICES, db_index=True)

    # Requirements
    required_cgpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True,
                                        help_text="Minimum CGPA out of 4.0")
    required_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                              help_text="Minimum percentage required")
    ielts_required = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True,
                                         help_text="Minimum IELTS score")

    # Scholarship details
    scholarship_amount = models.CharField(max_length=100,
                                          help_text="e.g. Full Tuition, $10,000/year, 50% waiver")
    application_deadline = models.DateField(db_index=True)
    seats_available = models.IntegerField(default=0, help_text="0 means unlimited")

    description = models.TextField()
    eligibility_criteria = models.TextField()
    application_link = models.URLField()

    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.university_name} ({self.country})"

    def get_scholarship_tier(self, student_percentage):
        """
        Determine what scholarship tier a student qualifies for.
        Returns tuple: (eligible: bool, tier_percentage: int, message: str)
        """
        min_required = float(self.required_percentage) if self.required_percentage else 0
        pct = float(student_percentage)

        if pct < min_required:
            return False, 0, f"Minimum {min_required}% required. You have {pct}%"

        if pct >= 90:
            return True, 100, "100% Scholarship - Excellent academic record!"
        elif pct >= 85:
            return True, 75, "75% Scholarship - Very good academic record!"
        elif pct >= 80:
            return True, 50, "50% Scholarship - Good academic record!"
        elif pct >= 70:
            return True, 25, "25% Scholarship - Meet minimum requirements."
        else:
            return False, 0, "Below minimum eligibility threshold (70%)"


class SavedScholarship(models.Model):
    """Scholarships bookmarked by students."""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_scholarships')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE,
                                    related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'scholarship']  # Can't save same scholarship twice
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.student.email} saved {self.scholarship.title}"
