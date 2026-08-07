from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with role support."""
    ROLE_STUDENT = 'student'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_ADMIN, 'Admin'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Use email as the login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_student(self):
        return self.role == self.ROLE_STUDENT

    @property
    def is_admin_user(self):
        return self.role == self.ROLE_ADMIN or self.is_staff


class StudentProfile(models.Model):
    """Extended profile for student users."""
    DEGREE_CHOICES = [
        ('bachelor', "Bachelor's"),
        ('master', "Master's"),
        ('phd', 'PhD'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    nationality = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True,
                               help_text="CGPA out of 4.0")
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                     help_text="Academic percentage (0-100)")
    ielts_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True,
                                      help_text="IELTS score out of 9.0")
    desired_degree = models.CharField(max_length=20, choices=DEGREE_CHOICES, blank=True)
    bio = models.TextField(blank=True)

    # ── Personal / Background ──────────────────────────────────────────
    address          = models.TextField(blank=True, help_text="Full home address")
    city             = models.CharField(max_length=100, blank=True)
    province         = models.CharField(max_length=100, blank=True)
    postal_code      = models.CharField(max_length=20, blank=True)

    # Father info
    father_name      = models.CharField(max_length=150, blank=True)
    father_contact   = models.CharField(max_length=20, blank=True)
    father_occupation= models.CharField(max_length=150, blank=True)

    # Mother info
    mother_name      = models.CharField(max_length=150, blank=True)
    mother_contact   = models.CharField(max_length=20, blank=True)
    mother_occupation= models.CharField(max_length=150, blank=True)

    # Emergency contact
    emergency_contact_name     = models.CharField(max_length=150, blank=True)
    emergency_contact_phone    = models.CharField(max_length=20,  blank=True)
    emergency_contact_relation = models.CharField(max_length=80,  blank=True)

    # Academic background
    last_institution   = models.CharField(max_length=255, blank=True, help_text="Last attended school/university")
    last_degree        = models.CharField(max_length=150, blank=True)
    graduation_year    = models.IntegerField(null=True, blank=True)
    field_of_study     = models.CharField(max_length=150, blank=True)
    extracurriculars   = models.TextField(blank=True, help_text="Clubs, sports, volunteering")
    achievements       = models.TextField(blank=True, help_text="Awards, publications, honours")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

    @property
    def scholarship_percentage(self):
        """Calculate scholarship eligibility percentage based on academic marks."""
        pct = float(self.percentage) if self.percentage else 0
        if pct >= 90:
            return 100
        elif pct >= 85:
            return 75
        elif pct >= 80:
            return 50
        elif pct >= 70:
            return 25
        else:
            return 0  # Not eligible
