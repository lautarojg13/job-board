import pytest

from rest_framework.test import APIClient
from django.urls import reverse


@pytest.mark.django_db
def test_get_job_applications_list_as_job_owner(user, application, job):
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse("get_job_applications", kwargs={"job_id": job.id})

    response = client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["job_id"] == job.id


@pytest.mark.django_db
def test_get_job_applications_list_forbidden_to_non_owner(user_2, application, job):
    client = APIClient()
    client.force_authenticate(user=user_2)
    url = reverse("get_job_applications", kwargs={"job_id": job.id})

    response = client.get(url)

    assert response.status_code == 403
