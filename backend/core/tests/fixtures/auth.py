import pytest
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.fixture
def user_tokens(user):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    return {
        "refresh": str(refresh),
        "access": str(access),
        "refresh_token_expires_time": int(refresh.lifetime.total_seconds()),
        "access_token_expires_time": int(access.lifetime.total_seconds())
    }
    
@pytest.fixture
def user_2_tokens(user_2):
    refresh = RefreshToken.for_user(user_2)
    access = refresh.access_token
    return {
        "refresh": str(refresh),
        "access": str(access),
        "refresh_token_expires_time": int(refresh.lifetime.total_seconds()),
        "access_token_expires_time": int(access.lifetime.total_seconds())
    }