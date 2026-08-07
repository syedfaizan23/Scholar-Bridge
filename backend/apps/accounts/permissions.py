from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff)
        )


class IsStudentUser(BasePermission):
    """Allow access only to student users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'student'
        )
