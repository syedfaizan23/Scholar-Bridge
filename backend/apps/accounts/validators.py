import re
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password


def validate_strong_password(password, user=None):
    """
    Requires: 8+ characters, at least one uppercase letter, one lowercase
    letter, one digit, and one special character. Raises DRF-style
    ValidationError (a list of messages) if the password doesn't qualify.
    """
    from rest_framework import serializers

    errors = []
    if len(password) < 8:
        errors.append('Password must be at least 8 characters long.')
    if not re.search(r'[A-Z]', password):
        errors.append('Password must contain at least one uppercase letter.')
    if not re.search(r'[a-z]', password):
        errors.append('Password must contain at least one lowercase letter.')
    if not re.search(r'\d', password):
        errors.append('Password must contain at least one number.')
    if not re.search(r'[!@#$%^&*()\-_=+\[\]{};:\'",.<>/?\\|`~]', password):
        errors.append('Password must contain at least one special character.')

    # Also run Django's own validators (catches common/similar-to-username
    # passwords) — these were configured in settings.py but never actually
    # wired into this app's registration/change-password flow.
    try:
        validate_password(password, user=user)
    except DjangoValidationError as e:
        errors.extend(e.messages)

    if errors:
        raise serializers.ValidationError(errors)
    return password
