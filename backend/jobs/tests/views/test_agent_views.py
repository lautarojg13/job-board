import pytest
from unittest.mock import patch

from celery import states
from django.urls import reverse
from rest_framework.test import APIClient

from jobs.choices import JobPostStatus
from jobs.models import JobPost
from jobs.views import JOB_SEARCH_STARTED_MESSAGE


class TestGetJobsByAgentView:

    @patch("jobs.views.process_ai_search_task")
    def test_202_with_task_id_when_prompt_is_valid(self, mock_task):
        client = APIClient()
        task_id = "task-agent-123"
        user_prompt = "Python developer"
        mock_task.delay.return_value.id = task_id

        response = client.post(
            reverse("get_jobs_by_agent"),
            {"user_prompt": user_prompt},
            format="json",
        )

        assert response.status_code == 202
        assert response.data["task_id"] == task_id
        assert response.data["message"] == JOB_SEARCH_STARTED_MESSAGE
        mock_task.delay.assert_called_once_with(user_prompt)

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
        task_id = "abc-123"
        task_result = mock_async_result.return_value
        task_result.status = states.SUCCESS
        task_result.ready.return_value = True
        task_result.result = {"jobs": []}

        response = client.get(reverse("task_status", kwargs={"task_id": task_id}))

        assert response.status_code == 200
        assert response.data == {
            "task_id": task_id,
            "status": states.SUCCESS,
            "result": {"jobs": []},
        }
        mock_async_result.assert_called_once_with(task_id)

    @patch("jobs.views.AsyncResult")
    def test_returns_null_result_when_not_ready(self, mock_async_result):
        client = APIClient()
        task_id = "abc-123"
        task_result = mock_async_result.return_value
        task_result.status = states.PENDING
        task_result.ready.return_value = False

        response = client.get(reverse("task_status", kwargs={"task_id": task_id}))

        assert response.status_code == 200
        assert response.data == {
            "task_id": task_id,
            "status": states.PENDING,
            "result": None,
        }
        mock_async_result.assert_called_once_with(task_id)

    @patch("jobs.views.AsyncResult")
    def test_returns_error_string_not_raw_exception_on_failure(self, mock_async_result):
        client = APIClient()
        task_id = "abc-123"
        task_result = mock_async_result.return_value
        task_result.status = states.FAILURE
        task_result.ready.return_value = True
        task_result.result = ValueError("There was an error while processing the data")

        response = client.get(reverse("task_status", kwargs={"task_id": task_id}))

        assert response.status_code == 200
        assert response.data["status"] == states.FAILURE
        assert response.data["result"] is None
        assert response.data["error"] == "There was an error while processing the data"
        mock_async_result.assert_called_once_with(task_id)


@pytest.mark.django_db
class TestGetOwnerJobPostListView:

    def test_returns_only_own_active_jobs(self, user, user_2, company):
        my_title = "My job"
        JobPost.objects.create(
            posted_by=user, company=company, title=my_title
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
        assert {job["title"] for job in response.data} == {my_title}

    def test_unauthenticated_user_gets_401(self):
        client = APIClient()

        response = client.get(reverse("get_own_jobs_list"))

        assert response.status_code == 401