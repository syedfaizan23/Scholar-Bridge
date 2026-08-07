from rest_framework import serializers
from .models import Review


class StudentReviewSerializer(serializers.ModelSerializer):
    """Used by a student to submit or edit their own review."""

    class Meta:
        model = Review
        fields = ['id', 'rating', 'title', 'body', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'created_at', 'updated_at']


class PublicReviewSerializer(serializers.ModelSerializer):
    """Used on the public Reviews page — approved reviews only, no admin fields."""

    student_name = serializers.SerializerMethodField()
    student_country = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'rating', 'title', 'body', 'created_at', 'student_name', 'student_country']

    def get_student_name(self, obj):
        first = obj.student.first_name
        last_initial = obj.student.last_name[:1] + '.' if obj.student.last_name else ''
        return f'{first} {last_initial}'.strip() or obj.student.username

    def get_student_country(self, obj):
        profile = getattr(obj.student, 'student_profile', None)
        return profile.nationality if profile else ''


class AdminReviewSerializer(serializers.ModelSerializer):
    """Used on the admin moderation page — full detail, is_approved is editable."""

    student_name = serializers.SerializerMethodField()
    student_email = serializers.CharField(source='student.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'rating', 'title', 'body', 'is_approved', 'created_at', 'updated_at',
                  'student_name', 'student_email']
        read_only_fields = ['id', 'rating', 'title', 'body', 'created_at', 'updated_at',
                             'student_name', 'student_email']

    def get_student_name(self, obj):
        return f'{obj.student.first_name} {obj.student.last_name}'.strip() or obj.student.username
