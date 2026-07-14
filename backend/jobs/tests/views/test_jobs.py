import pytest

from rest_framework.test import APIClient

from django.urls import reverse

from jobs.models import JobPost
from jobs.choices import JobPostStatus

# VIEWS TESTS

#GET TESTS
class TestGetJobsList:

    @pytest.mark.django_db
    def test_unauthenticated_user_can_list(self, user, job):
        client = APIClient()

        url = reverse("get_jobs_list")
        response = client.get(url)

        assert JobPost.objects.all().count() == len(response.data)
        assert response.status_code == 200

#POST TESTS
class TestPostJob:

    @pytest.mark.django_db
    def test_post_job(self, user_tokens):
        client = APIClient()

        data = {
            "title":"IA Dev",
            "description":"Simple Description",
            "min_wage":100,
            "max_wage":200
        }

        client.credentials(HTTP_AUTHORIZATION=f"Bearer {user_tokens['access']}")
        response = client.post(reverse("post_job"),data=data)

        assert response.status_code == 201

class TestGetJobDetails:

    @pytest.mark.django_db
    def test_get_job_details(self, user, job):
        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse("get_job_details", kwargs={"job_id":job.id})

        response = client.get(url)

        assert response.status_code == 200
        assert JobPost.objects.count() == 1
        assert JobPost.objects.get(id=job.id).title == response.data["title"]
        assert JobPost.objects.get(id=job.id).description == response.data["description"]

class TestUnauthenticatedUserCannotPost:

    @pytest.mark.django_db
    def test_unauthenticated_user_cannot_post(self):
        client = APIClient()

        url = reverse("post_job")
        response = client.post(url)

        assert response.status_code == 401

#PUT/PATCH TESTS
class TestEditJobPost:

    @pytest.mark.django_db
    def test_edit_job_post(self, job, user_tokens):
        client = APIClient()
        
        updated_data = {
            "title": "Django Developer",
            "description": "Develop and maintain Django applications."
        }
        
        access_token = user_tokens["access"]
        
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        
        response = client.put(reverse("edit_job_post", kwargs={"pk":job.id}),data=updated_data)
        
        job_instance = JobPost.objects.get(id=job.id)

        assert response.status_code == 200
        assert job_instance.title == updated_data["title"]
        assert job_instance.description == updated_data["description"]

#DELETE TESTS
class TestDeleteJobPost:

    @pytest.mark.django_db
    def test_delete_job_post_owner_can_delete(self, user, job):
        client = APIClient()

        client.force_authenticate(user=user)

        response = client.delete(reverse("delete_job_post", kwargs={"pk":job.id}))
        
        job.refresh_from_db()

        assert response.status_code == 204
        assert job.status == JobPostStatus.ARCHIVED


    @pytest.mark.django_db
    def test_delete_job_post_other_user_forbidden(self, user, user_2, job):
        client = APIClient()
        
        client.force_authenticate(user=user_2)

        response = client.delete(reverse("delete_job_post", kwargs={"pk":job.id}))
        
        job.refresh_from_db()

        assert response.status_code == 403
        assert job.status != JobPostStatus.ARCHIVED


    @pytest.mark.django_db
    def test_delete_job_post_not_found(self, user, job):
        client = APIClient()
        
        client.force_authenticate(user=user)

        response = client.delete(reverse("delete_job_post", kwargs={"pk":81684}))

        assert response.status_code == 404