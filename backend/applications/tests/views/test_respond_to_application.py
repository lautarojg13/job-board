import pytest

from rest_framework.test import APIClient
from django.urls import reverse

from applications.models import ApplicationStatus


@pytest.mark.django_db
@pytest.mark.parametrize("status_value", [
    status for status in ApplicationStatus.values
    if status != ApplicationStatus.PENDING
])
def test_respond_to_application_valid_statuses(user, application, status_value):
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("respond_to_application", kwargs={"application_id": application.id})

    response = client.patch(url, data={"application_status": status_value}, format="json")

    assert response.status_code == 200
    assert response.data["application_status"] == status_value

@pytest.mark.django_db
def test_respond_to_application_invalid_status(user, application):
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("respond_to_application", kwargs={"application_id": application.id})

    response = client.patch(url, data={"application_status": "invalid_status"}, format="json")

    assert response.status_code == 400
    assert "application_status" in response.data


@pytest.mark.django_db
def test_respond_to_application_forbidden_for_non_owner(user_2, application):
    client = APIClient()
    client.force_authenticate(user=user_2)
    url = reverse("respond_to_application", kwargs={"application_id": application.id})

    response = client.patch(url, data={"application_status": "rejected"}, format="json")

    assert response.status_code == 403


@pytest.mark.django_db
def test_respond_to_application_unauthenticated(application):
    client = APIClient()
    url = reverse("respond_to_application", kwargs={"application_id": application.id})

    response = client.patch(url, data={"application_status": "rejected"}, format="json")

    assert response.status_code == 401
