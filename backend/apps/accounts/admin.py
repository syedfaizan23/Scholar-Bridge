from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'nationality', 'cgpa', 'percentage', 'ielts_score']
    search_fields = ['user__email', 'nationality']
