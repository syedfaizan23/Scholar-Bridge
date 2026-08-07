from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScholarshipViewSet, SavedScholarshipViewSet

router = DefaultRouter()
router.register('scholarships', ScholarshipViewSet, basename='scholarships')
router.register('saved-scholarships', SavedScholarshipViewSet, basename='saved-scholarships')

urlpatterns = [
    path('', include(router.urls)),
]
