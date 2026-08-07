from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Review(models.Model):
    """A review a student can submit from their dashboard, shown publicly once approved."""

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating  = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title   = models.CharField(max_length=150)
    body    = models.TextField()

    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student} — {self.rating}★ — {self.title}'
