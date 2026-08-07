from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Scholarship, SavedScholarship
from .serializers import (
    ScholarshipSerializer, ScholarshipCreateSerializer,
    SavedScholarshipSerializer, EligibilityCheckSerializer
)
from .filters import ScholarshipFilter
from apps.accounts.permissions import IsAdminUser


class ScholarshipViewSet(viewsets.ModelViewSet):
    """
    CRUD for scholarships.
    - List/Retrieve: any authenticated user
    - Create/Update/Delete: admin only
    """
    queryset = Scholarship.objects.all()
    filter_class = ScholarshipFilter
    filterset_class = ScholarshipFilter
    search_fields = ['title', 'university_name', 'country', 'description']
    ordering_fields = ['application_deadline', 'created_at', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ScholarshipCreateSerializer
        return ScholarshipSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Scholarship.objects.all()
        # Students only see active scholarships
        if self.request.user.is_authenticated and not (
            self.request.user.role == 'admin' or self.request.user.is_staff
        ):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_context(self):
        """
        Precomputes the current user's saved/applied scholarship IDs once
        per request, rather than the serializer running a query per row —
        without this, a page of 10 scholarships fired up to 20 extra
        queries just to answer "did I save/apply to this one".
        """
        context = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated:
            context['saved_ids'] = set(
                SavedScholarship.objects.filter(student=user).values_list('scholarship_id', flat=True)
            )
            from apps.applications.models import Application
            context['applied_ids'] = set(
                Application.objects.filter(student=user).values_list('scholarship_id', flat=True)
            )
        return context

    @action(detail=True, methods=['get'])
    def check_eligibility(self, request, pk=None):
        """Check if the current student is eligible for this scholarship."""
        scholarship = self.get_object()
        try:
            profile = request.user.student_profile
            if not profile.percentage:
                return Response({'error': 'Please update your percentage in profile first'},
                                status=status.HTTP_400_BAD_REQUEST)
            eligible, tier, message = scholarship.get_scholarship_tier(profile.percentage)
            return Response({
                'scholarship_id': scholarship.id,
                'scholarship_title': scholarship.title,
                'is_eligible': eligible,
                'scholarship_tier': tier,
                'message': message,
                'your_percentage': float(profile.percentage),
                'required_percentage': float(scholarship.required_percentage) if scholarship.required_percentage else 0,
            })
        except Exception:
            return Response({'error': 'Student profile not found. Please complete your profile.'},
                            status=status.HTTP_400_BAD_REQUEST)


class SavedScholarshipViewSet(viewsets.ModelViewSet):
    """Manage a student's saved/bookmarked scholarships."""
    serializer_class = SavedScholarshipSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return SavedScholarship.objects.none()
        return SavedScholarship.objects.filter(
            student=self.request.user).select_related('scholarship')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.student != request.user:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response({'message': 'Removed from saved scholarships'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    def remove_by_scholarship(self, request):
        """Remove saved scholarship by scholarship ID."""
        scholarship_id = request.data.get('scholarship_id')
        try:
            saved = SavedScholarship.objects.get(
                student=request.user, scholarship_id=scholarship_id)
            saved.delete()
            return Response({'message': 'Removed from saved'})
        except SavedScholarship.DoesNotExist:
            return Response({'error': 'Not in saved list'}, status=status.HTTP_404_NOT_FOUND)
