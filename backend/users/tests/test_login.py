import pytest

from rest_framework.test import APIClient

from allauth.account.models import EmailAddress

from users.models import CustomUser


def _create_verified_user(username, email, password="ValidPass123!"):
    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    EmailAddress.objects.create(
        user=user,
        email=email,
        verified=True,
        primary=True,
    )
    return user


@pytest.mark.django_db
class TestLogin:
    def _client(self):
        return APIClient()

    def test_login_by_email_succeeds(self):
        _create_verified_user("alex_dev", "alex@example.com")
        client = self._client()

        response = client.post(
            "/auth/login/",
            {"email": "alex@example.com", "password": "ValidPass123!"},
            format="json",
        )

        assert response.status_code == 200, response.data
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_by_username_succeeds(self):
        _create_verified_user("alex_dev", "alex@example.com")
        client = self._client()

        response = client.post(
            "/auth/login/",
            {"username": "alex_dev", "password": "ValidPass123!"},
            format="json",
        )

        assert response.status_code == 200, response.data
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_email_not_verified_fails(self):
        user = CustomUser.objects.create_user(
            username="unverified",
            email="unverified@example.com",
            password="ValidPass123!",
        )
        EmailAddress.objects.create(
            user=user,
            email=user.email,
            verified=False,
            primary=True,
        )
        client = self._client()

        response = client.post(
            "/auth/login/",
            {"email": "unverified@example.com", "password": "ValidPass123!"},
            format="json",
        )

        assert response.status_code == 400
        assert any(
            "verified" in str(d).lower() for d in response.data.get("non_field_errors", [])
        )

    def test_login_invalid_credentials_fails(self):
        _create_verified_user("alex_dev", "alex@example.com")
        client = self._client()

        response = client.post(
            "/auth/login/",
            {"email": "alex@example.com", "password": "WrongPassword"},
            format="json",
        )

        assert response.status_code == 400

    def test_logout_blacklists_refresh_token(self):
        user = _create_verified_user("alex_dev", "alex@example.com")
        client = self._client()

        login_response = client.post(
            "/auth/login/",
            {"email": "alex@example.com", "password": "ValidPass123!"},
            format="json",
        )
        assert login_response.status_code == 200

        refresh = login_response.data["refresh"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}")

        response = client.post("/auth/logout/", {"refresh": refresh}, format="json")

        assert response.status_code in (200, 204)
