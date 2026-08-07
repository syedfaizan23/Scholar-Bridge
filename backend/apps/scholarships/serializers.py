from rest_framework import serializers
from .models import Scholarship, SavedScholarship


class ScholarshipSerializer(serializers.ModelSerializer):
    """Full scholarship serializer."""
    is_saved = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()

    class Meta:
        model = Scholarship
        fields = [
            'id', 'title', 'university_name', 'country', 'degree_level',
            'required_cgpa', 'required_percentage', 'ielts_required',
            'scholarship_amount', 'application_deadline', 'seats_available',
            'description', 'eligibility_criteria', 'application_link',
            'is_active', 'created_at', 'updated_at',
            'is_saved', 'is_applied', 'days_until_deadline'
        ]

    def get_is_saved(self, obj):
        """Check if current user saved this scholarship."""
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return False
        saved_ids = self.context.get('saved_ids')
        if saved_ids is not None:
            return obj.id in saved_ids
        return SavedScholarship.objects.filter(student=request.user, scholarship=obj).exists()

    def get_is_applied(self, obj):
        """Check if current user applied to this scholarship."""
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return False
        applied_ids = self.context.get('applied_ids')
        if applied_ids is not None:
            return obj.id in applied_ids
        return obj.applications.filter(student=request.user).exists()

    def get_days_until_deadline(self, obj):
        from django.utils import timezone
        from datetime import date
        today = date.today()
        delta = obj.application_deadline - today
        return delta.days


class ScholarshipCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating scholarships (admin use)."""
    class Meta:
        model = Scholarship
        fields = [
            'id', 'title', 'university_name', 'country', 'degree_level',
            'required_cgpa', 'required_percentage', 'ielts_required',
            'scholarship_amount', 'application_deadline', 'seats_available',
            'description', 'eligibility_criteria', 'application_link', 'is_active'
        ]


class SavedScholarshipSerializer(serializers.ModelSerializer):
    """Serializer for saved scholarships."""
    scholarship = ScholarshipSerializer(read_only=True)
    scholarship_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedScholarship
        fields = ['id', 'scholarship', 'scholarship_id', 'saved_at']

    def validate_scholarship_id(self, value):
        if not Scholarship.objects.filter(id=value).exists():
            raise serializers.ValidationError("Scholarship not found.")
        return value

    def create(self, validated_data):
        student = self.context['request'].user
        scholarship_id = validated_data['scholarship_id']
        scholarship = Scholarship.objects.get(id=scholarship_id)

        # Check if already saved
        saved, created = SavedScholarship.objects.get_or_create(
            student=student, scholarship=scholarship)
        if not created:
            raise serializers.ValidationError("Scholarship already saved.")
        return saved


class EligibilityCheckSerializer(serializers.Serializer):
    """Serializer for eligibility check response."""
    scholarship_id = serializers.IntegerField()
    scholarship_title = serializers.CharField()
    is_eligible = serializers.BooleanField()
    scholarship_tier = serializers.IntegerField()
    message = serializers.CharField()
