from django.contrib import admin
from .models import Scholarship, SavedScholarship

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ['title', 'university_name', 'country', 'degree_level',
                    'scholarship_amount', 'application_deadline', 'is_active']
    list_filter = ['country', 'degree_level', 'is_active']
    search_fields = ['title', 'university_name']

@admin.register(SavedScholarship)
class SavedScholarshipAdmin(admin.ModelAdmin):
    list_display = ['student', 'scholarship', 'saved_at']
