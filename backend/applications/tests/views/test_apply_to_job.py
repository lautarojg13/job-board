import pytest

from rest_framework.test import APIClient
from unittest.mock import patch
from django.urls import reverse
from applications.models import Application

class TestApplyToJob:

    @pytest.mark.django_db
    @patch("core.emails.send_email_task.delay")
    def test_apply_to_job_authenticated(self, mock_delay, user_2, job, valid_pdf):
        
        client = APIClient()
        client.force_authenticate(user=user_2)
        url = reverse("apply_to_job", kwargs={"job_id": job.id})

        data = {
            "cover_letter": "I am very interested in this position.",
            "resume": valid_pdf
        }

        response = client.post(url, data, format="multipart")
        
        assert response.status_code == 201
        assert Application.objects.filter(applicant=user_2, job=job).exists()
        mock_delay.assert_called_once()

    @pytest.mark.django_db
    def test_apply_to_job_unauthenticated(self, user_2, job):
        
        client = APIClient()
        url = reverse("apply_to_job", kwargs={"job_id": job.id})

        response = client.post(url, {"cover_letter": "Trying unauthenticated"}, format="json")
        
        assert response.status_code == 401

    @pytest.mark.django_db
    @patch("core.emails.send_email_task.delay")
    def test_apply_twice_to_same_job(self, mock_delay, user_2, job, valid_pdf):
        client = APIClient()
        client.force_authenticate(user=user_2)
        url = reverse("apply_to_job", kwargs={"job_id": job.id})
        
        data = {
            "cover_letter": "I am very interested in this position.",
            "resume": valid_pdf
        }

        response1 = client.post(url, data, format="multipart")
        assert response1.status_code == 201
        
        valid_pdf.seek(0)

        response2 = client.post(url, data, format="multipart")
        assert response2.status_code == 400

        assert response2.data["detail"] == "You already applied this job"
        mock_delay.assert_called_once()

    @pytest.mark.django_db
    def test_apply_to_nonexistent_job(self, user_2):
        
        client = APIClient()
        client.force_authenticate(user=user_2)
        url = reverse("apply_to_job", kwargs={"job_id": 432})

        response = client.post(url, {"cover_letter": "Invalid job"}, format="json")
        
        assert response.status_code == 404

    @pytest.mark.django_db
    def test_apply_to_own_job(self, user, job, valid_pdf):
        
        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse("apply_to_job", kwargs={"job_id": job.id})

        response = client.post(url, {"cover_letter": "Applying to my own job", "resume": valid_pdf}, format="multipart")

        assert response.status_code == 400
        assert response.data["detail"] == "You cannot apply your own job"
