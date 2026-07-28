from django.contrib import admin
from django.urls import path, include

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("users/", include("users.urls")),
    path("applications/", include("applications.urls")),
    path("companies/", include("companies.urls")),
    path("jobs/", include("jobs.urls")),
    
    
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
