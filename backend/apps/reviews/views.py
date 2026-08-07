from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Review
from .serializers import StudentReviewSerializer, PublicReviewSerializer, AdminReviewSerializer
from apps.accounts.permissions import IsAdminUser, IsStudentUser


class ReviewViewSet(viewsets.ModelViewSet):
    """
    GET    /api/reviews/          - public, approved reviews only
    GET    /api/reviews/mine/     - student, their own review (any approval state)
    POST   /api/reviews/          - student, submit a review (one per student)
    PATCH  /api/reviews/{id}/     - student edits their own (resets to pending) OR admin approves/rejects
    DELETE /api/reviews/{id}/     - student deletes their own, or admin deletes any
    """
    queryset = Review.objects.select_related('student', 'student__student_profile')

    def get_serializer_class(self):
        if self.request.user.is_authenticated and getattr(self.request.user, 'role', None) == 'admin':
            return AdminReviewSerializer
        if self.action in ('create', 'update', 'partial_update', 'mine'):
            return StudentReviewSerializer
        return PublicReviewSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action == 'mine':
            return [IsStudentUser()]
        if self.action == 'create':
            return [IsStudentUser()]
        return [IsAuthenticated()]  # update/partial_update/destroy checked per-object below

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'admin':
            qs = Review.objects.select_related('student', 'student__student_profile')
            is_approved = self.request.query_params.get('is_approved')
            if is_approved is not None:
                qs = qs.filter(is_approved=(is_approved.lower() == 'true'))
            return qs

        from django.db.models import Q
        if user.is_authenticated and self.action != 'list':
            # Lets a student reach their own review (even if not yet approved)
            # for retrieve/update/destroy. The public list stays approved-only.
            return Review.objects.filter(Q(is_approved=True) | Q(student=user)) \
                .select_related('student', 'student__student_profile')
        return Review.objects.filter(is_approved=True).select_related('student', 'student__student_profile')

    @action(detail=False, methods=['get'])
    def mine(self, request):
        review = Review.objects.filter(student=request.user).first()
        if not review:
            return Response(None)
        return Response(StudentReviewSerializer(review).data)

    def create(self, request, *args, **kwargs):
        if Review.objects.filter(student=request.user).exists():
            return Response({'error': 'You already submitted a review. Edit your existing one instead.'},
                             status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        is_admin = getattr(user, 'role', None) == 'admin'

        if is_admin:
            # Admin can only toggle approval, not rewrite the student's content.
            serializer = AdminReviewSerializer(instance, data={'is_approved': request.data.get('is_approved')}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        if instance.student_id != user.id:
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StudentReviewSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_approved=False)  # edited content goes back to pending review
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        is_admin = getattr(user, 'role', None) == 'admin'
        if not is_admin and instance.student_id != user.id:
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
