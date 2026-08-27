from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

from dj_rest_auth.registration.views import VerifyEmailView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from drf_spectacular.utils import extend_schema
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

class CustomConfirmEmailView(VerifyEmailView):

    def get(self, request, *args, **kwargs):
        self.kwargs["key"] = kwargs.get("key")
        confirmation = self.get_object()
        confirmation.confirm(self.request)

        return HttpResponse(
            "Account verified successfully! You can now access the API"
        )


@extend_schema(
    responses={
        200: {
            "type": "object",
            "properties": {
                "access": {"type": "string"},
                "refresh": {"type": "string"},
            },
        }
    },
)
class SchemaAnnotatedTokenObtainPairView(TokenObtainPairView):
    """TokenObtainPairView with drf-spectacular response schema."""

urlpatterns = [
    path('admin/', admin.site.urls),
    path("users/", include("users.urls")),
    path("applications/", include("applications.urls")),
    path("companies/", include("companies.urls")),
    path("jobs/", include("jobs.urls")),
    
    path(
        "auth/registration/account-confirm-email/<str:key>/",
        CustomConfirmEmailView.as_view(),
        name="account_confirm_email",
    ),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/', include('dj_rest_auth.urls')),

    path('auth/token/', SchemaAnnotatedTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
