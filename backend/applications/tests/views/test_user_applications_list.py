import pytest

from rest_framework.test import APIClient
from django.urls import reverse


@pytest.mark.django_db
def test_get_user_applications_list_authenticated(user, application):
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("get_user_applications")

    response = client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["id"] == application.id


@pytest.mark.django_db
def test_get_user_applications_list_unauthenticated():
    client = APIClient()
    url = reverse("get_user_applications")

    response = client.get(url)

    assert response.status_code == 401
