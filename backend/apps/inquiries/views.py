from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import ContactInquiry
from .serializers import ContactInquirySerializer, AdminContactInquirySerializer
from apps.accounts.permissions import IsAdminUser


class ContactInquiryViewSet(viewsets.ModelViewSet):
    """
    POST   /api/inquiries/          - anyone can submit a message (Contact Us page)
    GET    /api/inquiries/          - admin only, supports ?search= and ?status=
    GET    /api/inquiries/{id}/     - admin only
    PATCH  /api/inquiries/{id}/     - admin only, status updates
    DELETE /api/inquiries/{id}/     - admin only
    """
    queryset = ContactInquiry.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'email', 'subject', 'message']

    def get_serializer_class(self):
        if self.action == 'create':
            return ContactInquirySerializer
        return AdminContactInquirySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': "Thanks for reaching out — we'll get back to you soon."},
            status=status.HTTP_201_CREATED,
        )
