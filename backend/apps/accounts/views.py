from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import StudentProfile
from .serializers import (
    RegisterSerializer, UserSerializer, StudentProfileSerializer,
    UserListSerializer, ChangePasswordSerializer
)
from .permissions import IsAdminUser

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Student registration endpoint."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Return tokens on registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LogoutView(generics.GenericAPIView):
    """Logout by blacklisting the refresh token."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={'refresh': openapi.Schema(type=openapi.TYPE_STRING)},
            required=['refresh']
        )
    )
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update the logged-in student's profile."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        # Different serializers for user vs profile data
        if self.request.method in ['PUT', 'PATCH']:
            return StudentProfileSerializer
        return UserSerializer

    def get_object(self):
        if self.request.method in ['PUT', 'PATCH']:
            # Return the student profile for updates
            profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
            return profile
        return self.request.user


class DeleteAccountView(generics.DestroyAPIView):
    """Allow student to delete their own account."""
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)


class ChangePasswordView(generics.UpdateAPIView):
    """Change password endpoint."""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Wrong current password'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})


# ---- Admin Views ----

class AdminStudentViewSet(viewsets.ModelViewSet):
    """Admin: manage all students."""
    queryset = User.objects.filter(role=User.ROLE_STUDENT).select_related('student_profile').order_by('-created_at')
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'delete', 'patch']

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Activate or deactivate a student account."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        status_text = 'activated' if user.is_active else 'deactivated'
        return Response({'message': f'Student {status_text}', 'is_active': user.is_active})


class DashboardStatsView(APIView):
    """Get dashboard stats for student."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.applications.models import Application
        from apps.scholarships.models import SavedScholarship

        user = request.user
        total_scholarships = 0

        try:
            from apps.scholarships.models import Scholarship
            total_scholarships = Scholarship.objects.filter(is_active=True).count()
        except Exception:
            pass

        applications = Application.objects.filter(student=user)
        saved = SavedScholarship.objects.filter(student=user).count()

        return Response({
            'total_scholarships': total_scholarships,
            'saved_scholarships': saved,
            'total_applications': applications.count(),
            'approved_applications': applications.filter(status='approved').count(),
            'rejected_applications': applications.filter(status='rejected').count(),
            'pending_applications': applications.filter(status='pending').count(),
        })


class AdminDashboardStatsView(APIView):
    """Get dashboard stats for admin."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.applications.models import Application
        from apps.scholarships.models import Scholarship

        apps = Application.objects.all()
        return Response({
            'total_students': User.objects.filter(role=User.ROLE_STUDENT).count(),
            'total_scholarships': Scholarship.objects.count(),
            'total_applications': apps.count(),
            'approved_applications': apps.filter(status='approved').count(),
            'rejected_applications': apps.filter(status='rejected').count(),
            'pending_applications': apps.filter(status='pending').count(),
        })
