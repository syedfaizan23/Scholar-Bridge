"""
Management command: python manage.py expire_challans

Run this daily via cron or a scheduler (e.g. django-crontab, Celery Beat,
or a simple cron job):
    0 2 * * * cd /path/to/backend && python manage.py expire_challans

It hard-deletes all PENDING applications whose 20-day challan deadline
has passed, removing them from both student and admin views automatically.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.applications.models import Application


class Command(BaseCommand):
    help = 'Delete all pending applications whose challan deadline has expired (20-day window).'

    def handle(self, *args, **kwargs):
        now     = timezone.now()
        overdue = Application.objects.filter(
            status=Application.STATUS_PENDING,
            challan_due_date__lt=now,
        )
        count   = overdue.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('No overdue challan applications found.'))
            return

        # Log before delete
        for app in overdue:
            self.stdout.write(
                f'  🗑  Removing: [{app.challan_number}] '
                f'{app.student.email} → {app.scholarship.title}'
            )

        overdue.delete()
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Removed {count} expired application(s) (challan not paid within 20 days).'))
