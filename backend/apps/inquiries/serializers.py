from rest_framework import serializers
from .models import ContactInquiry


class ContactInquirySerializer(serializers.ModelSerializer):
    """Used for the public submission endpoint — no status field, can't be spoofed."""

    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'phone', 'country', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Message must be at least 10 characters.')
        return value


class AdminContactInquirySerializer(serializers.ModelSerializer):
    """Full read/write serializer for the admin inquiries dashboard."""

    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'phone', 'country', 'subject', 'message',
                  'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'name', 'email', 'phone', 'country', 'subject',
                             'message', 'created_at', 'updated_at']
