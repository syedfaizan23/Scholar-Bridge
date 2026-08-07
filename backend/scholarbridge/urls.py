"""
ScholarBridge URL Configuration.

Routing layout:
  /django-admin/   -> Django's built-in admin
  /api/...         -> REST API (DRF)
  /swagger/        -> Swagger UI
  /redoc/          -> ReDoc UI
  /swagger.json    -> Raw OpenAPI schema
  /static/...      -> React build's static assets (JS/CSS bundles)
  everything else  -> React build's index.html (React Router handles the rest)
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ── Swagger schema ───────────────────────────────────────────────────────────
schema_view = get_schema_view(
    openapi.Info(
        title="ScholarBridge API",
        default_version='v1',
        description="""
        ScholarBridge - Foreign University Scholarship Finder System API

        This API provides endpoints for:
        - Student registration and authentication (JWT)
        - Scholarship search, filtering, and eligibility checks
        - Scholarship applications with challan-based payment workflow
        - Admin management (students, scholarships, applications)

        Use Bearer token authentication: `Bearer <your_jwt_token>`
        """,
        contact=openapi.Contact(email="admin@scholarbridge.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Django's own admin — moved off `/admin/` so it never collides with the
    # React app's client-side `/admin/dashboard`, `/admin/students`, etc.
    path('django-admin/', admin.site.urls),

    # ── REST API ──────────────────────────────────────────────────────────
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.scholarships.urls')),
    path('api/', include('apps.applications.urls')),
    path('api/', include('apps.inquiries.urls')),
    path('api/', include('apps.reviews.urls')),

    # ── API documentation ────────────────────────────────────────────────
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),

] + [

    # ── React build's static assets (JS/CSS chunks, manifest, etc.) ────────
    re_path(r'^static/(?P<path>.*)$',
            serve, {'document_root': settings.FRONTEND_DIR / 'static'}),
    path('favicon.ico', serve, {'document_root': settings.FRONTEND_DIR, 'path': 'favicon.ico'}),
    path('manifest.json', serve, {'document_root': settings.FRONTEND_DIR, 'path': 'manifest.json'}),
    path('robots.txt', serve, {'document_root': settings.FRONTEND_DIR, 'path': 'robots.txt'}),
    path('logo192.png', serve, {'document_root': settings.FRONTEND_DIR, 'path': 'logo192.png'}),
    path('logo512.png', serve, {'document_root': settings.FRONTEND_DIR, 'path': 'logo512.png'}),

    # ── React Router catch-all ──────────────────────────────────────────────
    # Any path not matched above (/, /login, /student/dashboard, /admin/*, etc.)
    # falls back to index.html so React Router renders the correct page client-side.
    re_path(r'^.*$', serve, {'document_root': settings.FRONTEND_DIR, 'path': 'index.html'}, name='react-app'),
]
