from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, LogoutView, ProfileView, DeleteAccountView,
    ChangePasswordView, AdminStudentViewSet, DashboardStatsView,
    AdminDashboardStatsView
)

# Router for admin student management
router = DefaultRouter()
router.register('admin/students', AdminStudentViewSet, basename='admin-students')

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Student profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Dashboard stats
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),

    # Admin student management (from router)
    path('', include(router.urls)),
]
