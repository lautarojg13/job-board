from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("users/", include("users.urls")),
    path("applications/", include("applications.urls")),
    path("companies/", include("companies.urls")),
    path("jobs/", include("jobs.urls")),
    
    
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/', include('dj_rest_auth.urls')),
]
