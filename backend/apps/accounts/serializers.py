from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile
from .validators import validate_strong_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for student registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm Password")
    nationality = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'password', 'password2', 'nationality']

    def validate_password(self, value):
        return validate_strong_password(value)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        # Remove extra fields not in User model
        nationality = validated_data.pop('nationality')
        validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
            role=User.ROLE_STUDENT,
        )
        # Create the student profile
        StudentProfile.objects.create(user=user, nationality=nationality)
        return user


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for student profile details."""
    scholarship_percentage = serializers.ReadOnlyField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'nationality', 'phone', 'date_of_birth', 'cgpa',
            'percentage', 'ielts_score', 'desired_degree', 'bio',
            'scholarship_percentage',
            # Address
            'address', 'city', 'province', 'postal_code',
            # Family
            'father_name', 'father_contact', 'father_occupation',
            'mother_name', 'mother_contact', 'mother_occupation',
            # Emergency
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            # Academic background
            'last_institution', 'last_degree', 'graduation_year',
            'field_of_study', 'extracurriculars', 'achievements',
            'created_at', 'updated_at',
        ]


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer including profile."""
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'is_active', 'created_at', 'student_profile']
        read_only_fields = ['role', 'is_active', 'created_at']


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing users (admin use)."""
    nationality = serializers.CharField(source='student_profile.nationality', default='')
    percentage = serializers.DecimalField(
        source='student_profile.percentage', max_digits=5, decimal_places=2, default=None)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'is_active', 'created_at', 'nationality', 'percentage']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        return validate_strong_password(value)
