import pytest
from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APIClient

from jobs.choices import JobPostStatus
from jobs.models import JobPost


class TestGetJobsByAgentView:

    @patch("jobs.views.process_ai_search_task")
    def test_202_with_task_id_when_prompt_is_valid(self, mock_task):
        client = APIClient()
        mock_task.delay.return_value.id = "task-agent-123"

        response = client.post(
            reverse("get_jobs_by_agent"),
            {"user_prompt": "Python developer"},
            format="json",
        )

        assert response.status_code == 202
        assert response.data["task_id"] == "task-agent-123"
        assert response.data["message"] == "Searching for jobs..."
        mock_task.delay.assert_called_once_with("Python developer")

    def test_400_when_prompt_is_too_short(self):
        client = APIClient()

        response = client.post(
            reverse("get_jobs_by_agent"),
            {"user_prompt": "Py"},
            format="json",
        )

        assert response.status_code == 400
        assert "user_prompt" in response.data


class TestTaskStatusView:

    @patch("jobs.views.AsyncResult")
    def test_returns_status_and_result_when_ready(self, mock_async_result):
        client = APIClient()
        task_result = mock_async_result.return_value
        task_result.status = "SUCCESS"
        task_result.ready.return_value = True
        task_result.result = {"jobs": []}

        response = client.get(reverse("task_status", kwargs={"task_id": "abc-123"}))

        assert response.status_code == 200
        assert response.data == {
            "task_id": "abc-123",
            "status": "SUCCESS",
            "result": {"jobs": []},
        }
        mock_async_result.assert_called_once_with("abc-123")

    @patch("jobs.views.AsyncResult")
    def test_returns_null_result_when_not_ready(self, mock_async_result):
        client = APIClient()
        task_result = mock_async_result.return_value
        task_result.status = "PENDING"
        task_result.ready.return_value = False

        response = client.get(reverse("task_status", kwargs={"task_id": "abc-123"}))

        assert response.status_code == 200
        assert response.data == {
            "task_id": "abc-123",
            "status": "PENDING",
            "result": None,
        }
        mock_async_result.assert_called_once_with("abc-123")


@pytest.mark.django_db
class TestGetOwnerJobPostListView:

    def test_returns_only_own_active_jobs(self, user, user_2, company):
        JobPost.objects.create(
            posted_by=user, company=company, title="My job"
        )
        JobPost.objects.create(
            posted_by=user, company=company, title="My archived job",
            status=JobPostStatus.ARCHIVED,
        )
        JobPost.objects.create(
            posted_by=user_2, company=company, title="Someone else's job"
        )

        client = APIClient()
        client.force_authenticate(user=user)

        response = client.get(reverse("get_own_jobs_list"))

        assert response.status_code == 200
        assert {job["title"] for job in response.data} == {"My job"}

    def test_unauthenticated_user_gets_401(self):
        client = APIClient()

        response = client.get(reverse("get_own_jobs_list"))

        assert response.status_code == 401