from rest_framework import serializers
from django.utils import timezone
from .models import Application
from apps.scholarships.serializers import ScholarshipSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Student-facing serializer — includes challan info."""
    scholarship        = ScholarshipSerializer(read_only=True)
    scholarship_id     = serializers.IntegerField(write_only=True)
    status_display     = serializers.CharField(source='get_status_display', read_only=True)
    student_name       = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email      = serializers.CharField(source='student.email', read_only=True)
    is_challan_overdue = serializers.BooleanField(read_only=True)
    challan_days_remaining = serializers.IntegerField(read_only=True)
    challan_image_url  = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = [
            'id', 'scholarship', 'scholarship_id', 'status', 'status_display',
            'applied_cgpa', 'applied_percentage', 'applied_ielts',
            'scholarship_tier', 'personal_statement', 'admin_notes',
            'student_name', 'student_email',
            # challan
            'challan_number', 'challan_amount', 'challan_due_date',
            'challan_paid_at', 'challan_image_url',
            'is_challan_overdue', 'challan_days_remaining',
            'applied_at', 'updated_at',
        ]
        read_only_fields = [
            'status', 'applied_cgpa', 'applied_percentage', 'applied_ielts',
            'scholarship_tier', 'admin_notes',
            'challan_number', 'challan_amount', 'challan_due_date',
            'challan_paid_at', 'applied_at', 'updated_at',
        ]

    def get_challan_image_url(self, obj):
        if obj.challan_image:
            request = self.context.get('request')
            path = f"/api/applications/{obj.id}/challan_image/"
            if request:
                return request.build_absolute_uri(path)
            return path
        return None

    def validate_scholarship_id(self, value):
        from apps.scholarships.models import Scholarship
        if not Scholarship.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Scholarship not found or inactive.")
        return value

    def validate(self, data):
        request      = self.context['request']
        student      = request.user
        scholarship_id = data.get('scholarship_id')

        if Application.objects.filter(student=student, scholarship_id=scholarship_id).exists():
            raise serializers.ValidationError("You have already applied for this scholarship.")

        try:
            profile = student.student_profile
            if not profile.percentage:
                raise serializers.ValidationError(
                    "Please update your academic percentage in your profile before applying.")
            from apps.scholarships.models import Scholarship
            scholarship = Scholarship.objects.get(id=scholarship_id)
            eligible, tier, message = scholarship.get_scholarship_tier(profile.percentage)
            if not eligible:
                raise serializers.ValidationError(f"Not eligible: {message}")
        except serializers.ValidationError:
            raise
        except Exception:
            pass
        return data

    def create(self, validated_data):
        validated_data.pop('scholarship_id', None)
        scholarship_id = self.initial_data.get('scholarship_id')
        from apps.scholarships.models import Scholarship
        scholarship = Scholarship.objects.get(id=scholarship_id)
        return Application.objects.create(
            student=self.context['request'].user,
            scholarship=scholarship,
            personal_statement=validated_data.get('personal_statement', ''),
        )


class AdminApplicationSerializer(serializers.ModelSerializer):
    """Admin-facing serializer — full details including challan image."""
    scholarship_title      = serializers.CharField(source='scholarship.title',           read_only=True)
    scholarship_university = serializers.CharField(source='scholarship.university_name', read_only=True)
    scholarship_country    = serializers.CharField(source='scholarship.country',         read_only=True)
    student_name           = serializers.CharField(source='student.get_full_name',       read_only=True)
    student_email          = serializers.CharField(source='student.email',               read_only=True)
    status_display         = serializers.CharField(source='get_status_display',          read_only=True)
    is_challan_overdue     = serializers.BooleanField(read_only=True)
    challan_days_remaining = serializers.IntegerField(read_only=True)
    challan_image_url      = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = [
            'id', 'student_name', 'student_email',
            'scholarship_title', 'scholarship_university', 'scholarship_country',
            'status', 'status_display',
            'applied_cgpa', 'applied_percentage', 'applied_ielts', 'scholarship_tier',
            'personal_statement', 'admin_notes',
            # challan
            'challan_number', 'challan_amount', 'challan_due_date',
            'challan_paid_at', 'challan_image_url',
            'is_challan_overdue', 'challan_days_remaining',
            'applied_at', 'updated_at',
        ]
        read_only_fields = ['applied_at', 'updated_at']

    def get_challan_image_url(self, obj):
        if obj.challan_image:
            request = self.context.get('request')
            path = f"/api/applications/{obj.id}/challan_image/"
            if request:
                return request.build_absolute_uri(path)
            return path
        return None
