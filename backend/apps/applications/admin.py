from django.contrib import admin
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'scholarship', 'status', 'scholarship_tier', 'applied_at']
    list_filter = ['status']
    search_fields = ['student__email', 'scholarship__title']
    readonly_fields = ['applied_at', 'updated_at']
