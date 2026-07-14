import pytest

from rest_framework.test import APIClient
from django.urls import reverse


@pytest.mark.django_db
def test_withdraw_application(user_2, testing_withdraw_application):
    client = APIClient()
    client.force_authenticate(user=user_2)
    url = reverse("withdraw_application", kwargs={"application_id": testing_withdraw_application.id})

    assert testing_withdraw_application.status == "pending"

    response = client.patch(url, format="json")
    testing_withdraw_application.refresh_from_db()

    assert response.status_code == 200
    assert response.data["status"] == "withdrawn"
    assert testing_withdraw_application.status == "withdrawn"


@pytest.mark.django_db
def test_withdraw_application_forbidden_for_non_applicant(user, testing_withdraw_application):
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("withdraw_application", kwargs={"application_id": testing_withdraw_application.id})

    response = client.patch(url, format="json")

    assert response.status_code == 403


@pytest.mark.django_db
def test_withdraw_application_unauthenticated(testing_withdraw_application):
    client = APIClient()
    url = reverse("withdraw_application", kwargs={"application_id": testing_withdraw_application.id})

    response = client.patch(url, format="json")

    assert response.status_code == 401
