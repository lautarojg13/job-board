import pytest

from rest_framework.test import APIClient
from django.urls import reverse


@pytest.mark.django_db
def test_get_application_detail_as_applicant(user, application):
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("get_application", kwargs={"application_id": application.id})

    response = client.get(url)

    assert response.status_code == 200
    assert response.data["id"] == application.id
    assert response.data["applicant_id"] == application.applicant.id


@pytest.mark.django_db
def test_get_application_detail_as_job_owner(user, user_2, job):
    application = job.applications.create(applicant=user_2)
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("get_application", kwargs={"application_id": application.id})

    response = client.get(url)

    assert response.status_code == 200
    assert response.data["id"] == application.id
    assert response.data["job_id"] == job.id


@pytest.mark.django_db
def test_get_application_detail_forbidden_to_unrelated_user(user_2, application):
    client = APIClient()
    client.force_authenticate(user=user_2)
    url = reverse("get_application", kwargs={"application_id": application.id})

    response = client.get(url)

    assert response.status_code == 403
