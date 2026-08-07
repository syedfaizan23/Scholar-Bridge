from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'rating', 'title', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating']
    search_fields = ['title', 'body', 'student__email', 'student__username']
    actions = ['approve_reviews', 'reject_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = 'Approve selected reviews'

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = 'Unapprove selected reviews'
