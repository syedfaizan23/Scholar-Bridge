from django.db import models


class ContactInquiry(models.Model):
    """A message submitted through the public Contact Us page."""

    STATUS_NEW         = 'new'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_RESOLVED    = 'resolved'
    STATUS_CLOSED      = 'closed'
    STATUS_CHOICES = [
        (STATUS_NEW, 'New'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_CLOSED, 'Closed'),
    ]

    name    = models.CharField(max_length=150)
    email   = models.EmailField()
    phone   = models.CharField(max_length=30, blank=True)
    country = models.CharField(max_length=100, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()

    status  = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Contact inquiries'

    def __str__(self):
        return f'{self.name} — {self.subject}'
