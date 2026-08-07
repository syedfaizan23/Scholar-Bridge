from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.http import FileResponse, Http404

from .models import Application
from .serializers import ApplicationSerializer, AdminApplicationSerializer
from apps.accounts.permissions import IsAdminUser


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    Student  : view & manage own applications, upload challan.
    Admin    : view all applications, approve/reject, view challan images.
    """
    permission_classes = [IsAuthenticated]
    parser_classes     = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if getattr(self, 'swagger_fake_view', False):
            return ApplicationSerializer
        user = self.request.user
        if user.role == 'admin' or user.is_staff:
            return AdminApplicationSerializer
        return ApplicationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Application.objects.none()
        user = self.request.user
        if user.role == 'admin' or user.is_staff:
            qs = Application.objects.select_related('student', 'scholarship').all()
            status_filter = self.request.query_params.get('status')
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs
        qs = Application.objects.filter(student=user).select_related('scholarship')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def create(self, request, *args, **kwargs):
        if request.user.role == 'admin' or request.user.is_staff:
            return Response({'error': 'Admins cannot apply for scholarships.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        application = self.get_object()
        user = request.user
        if user.role != 'admin' and not user.is_staff:
            if application.student != user:
                return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
            if application.status not in (Application.STATUS_PENDING, Application.STATUS_CHALLAN_PAID):
                return Response(
                    {'error': 'Only pending or unpaid applications can be cancelled.'},
                    status=status.HTTP_400_BAD_REQUEST)
            application.status = Application.STATUS_CANCELLED
            application.save()
            return Response({'message': 'Application cancelled.'})
        application.delete()
        return Response({'message': 'Application deleted.'})

    # ── STUDENT: upload signed challan image ─────────────────────────
    @action(detail=True, methods=['patch'], url_path='upload_challan',
            parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_challan(self, request, pk=None):
        """Student uploads a photo/scan of their paid & signed challan."""
        application = self.get_object()

        if application.student != request.user:
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

        if application.status not in (Application.STATUS_PENDING,):
            return Response(
                {'error': 'Challan can only be uploaded for pending applications.'},
                status=status.HTTP_400_BAD_REQUEST)

        if application.is_challan_overdue:
            return Response(
                {'error': 'Challan deadline has passed. Application is expired.'},
                status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES.get('challan_image')
        if not image:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
        if image.content_type not in allowed:
            return Response({'error': 'Only JPG, PNG, WEBP, or PDF files accepted.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Validate size (max 5 MB)
        if image.size > 5 * 1024 * 1024:
            return Response({'error': 'File size must be under 5 MB.'},
                            status=status.HTTP_400_BAD_REQUEST)

        application.challan_image   = image
        application.challan_paid_at = timezone.now()
        application.status          = Application.STATUS_CHALLAN_PAID
        application.save()

        serializer = self.get_serializer(application, context={'request': request})
        return Response({
            'message': 'Challan uploaded successfully! Your application is now under review.',
            'data': serializer.data,
        })

    # ── VIEW/DOWNLOAD: challan receipt image (owner or admin only) ────
    @action(detail=True, methods=['get'], url_path='challan_image')
    def challan_image(self, request, pk=None):
        """Serve the uploaded challan receipt to its owner or an admin."""
        application = self.get_object()
        user = request.user
        if not (user.role == 'admin' or user.is_staff or application.student == user):
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        if not application.challan_image:
            raise Http404('No challan image uploaded for this application.')
        import mimetypes
        content_type, _ = mimetypes.guess_type(application.challan_image.name)
        return FileResponse(application.challan_image.open('rb'),
                             content_type=content_type or 'application/octet-stream')

    # ── ADMIN: approve ────────────────────────────────────────────────
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        application = self.get_object()
        if application.status != Application.STATUS_CHALLAN_PAID:
            return Response(
                {'error': 'Only applications with a verified challan upload can be approved.'},
                status=status.HTTP_400_BAD_REQUEST)
        application.status      = Application.STATUS_APPROVED
        application.admin_notes = request.data.get('admin_notes', application.admin_notes)
        application.save()
        return Response({
            'message': 'Application approved.',
            'data': AdminApplicationSerializer(application, context={'request': request}).data,
        })

    # ── ADMIN: reject ─────────────────────────────────────────────────
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status      = Application.STATUS_REJECTED
        application.admin_notes = request.data.get('admin_notes', application.admin_notes)
        application.save()
        return Response({
            'message': 'Application rejected.',
            'data': AdminApplicationSerializer(application, context={'request': request}).data,
        })

    # ── ADMIN: manually expire overdue applications ───────────────────
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser],
            url_path='expire_overdue')
    def expire_overdue(self, request):
        """Manually trigger expiry of all overdue pending applications."""
        count = _expire_overdue_applications()
        return Response({'message': f'{count} overdue application(s) removed.'})


def _expire_overdue_applications():
    """
    Find all PENDING applications whose challan_due_date has passed,
    mark them EXPIRED, and hard-delete them from the DB so they vanish
    from both student and admin views.
    """
    now     = timezone.now()
    overdue = Application.objects.filter(
        status=Application.STATUS_PENDING,
        challan_due_date__lt=now,
    )
    count = overdue.count()
    # Hard delete — removes from both student and admin views
    overdue.delete()
    return count
