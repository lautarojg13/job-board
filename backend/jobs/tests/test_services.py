import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from rest_framework.exceptions import ValidationError

from jobs.choices import EmploymentTypes
from jobs.services import get_jobs_by_agent_service


class TestGetJobsByAgentService:

    @patch("jobs.services.build_jobs_queryset")
    @patch("jobs.services.JobAssistantAgent")
    @pytest.mark.asyncio
    async def test_returns_queryset_after_retry_when_agent_response_becomes_valid(
        self,
        mock_job_assistant_class,
        mock_build_jobs_queryset,
    ):
        job = MagicMock(name="job")
        mock_build_jobs_queryset.return_value = [job]

        mock_agent = mock_job_assistant_class.return_value
        mock_agent.search_job_params = AsyncMock(
            side_effect=[
                {"employment_type": "INVALID"},
                {"employment_type": EmploymentTypes.FULL_TIME},
            ]
        )

        result = await get_jobs_by_agent_service("Python developer")

        assert result == [job]
        assert mock_agent.search_job_params.await_count == 2
        assert mock_agent.search_job_params.await_args_list[0].args == (
            "Python developer",
        )
        assert mock_agent.search_job_params.await_args_list[0].kwargs == {
            "errors": None,
        }
        assert "employment_type" in mock_agent.search_job_params.await_args_list[1].kwargs["errors"]

        called_valid_data = mock_build_jobs_queryset.call_args.args[0]
        assert called_valid_data["employment_type"] == EmploymentTypes.FULL_TIME

    @patch("jobs.services.build_jobs_queryset")
    @patch("jobs.services.JobAssistantAgent")
    @pytest.mark.asyncio
    async def test_raises_when_agent_returns_invalid_data_three_times(
        self,
        mock_job_assistant_class,
        mock_build_jobs_queryset,
    ):
        mock_build_jobs_queryset.return_value = []

        mock_agent = mock_job_assistant_class.return_value
        mock_agent.search_job_params = AsyncMock(
            side_effect=[
                {"employment_type": "INVALID"},
                {"employment_type": "INVALID"},
                {"employment_type": "INVALID"},
            ]
        )

        with pytest.raises(ValidationError, match="There was an error while processing the data"):
            await get_jobs_by_agent_service("Python developer")

        assert mock_agent.search_job_params.await_count == 3
        mock_build_jobs_queryset.assert_not_called()

    @patch("jobs.services.build_jobs_queryset")
    @patch("jobs.services.JobAssistantAgent")
    @pytest.mark.asyncio
    async def test_retries_cleanly_then_succeeds_when_agent_returns_provider_error(
        self,
        mock_job_assistant_class,
        mock_build_jobs_queryset,
    ):
        job = MagicMock(name="job")
        mock_build_jobs_queryset.return_value = [job]

        mock_agent = mock_job_assistant_class.return_value
        mock_agent.search_job_params = AsyncMock(
            side_effect=[
                {"error": "AI service error.", "details": "500 Internal Server Error"},
                {"employment_type": EmploymentTypes.FULL_TIME},
            ]
        )

        result = await get_jobs_by_agent_service("Python developer")

        assert result == [job]
        assert mock_agent.search_job_params.await_count == 2
        for call in mock_agent.search_job_params.await_args_list:
            assert call.kwargs["errors"] is None

    @patch("jobs.services.build_jobs_queryset")
    @patch("jobs.services.JobAssistantAgent")
    @pytest.mark.asyncio
    async def test_raises_when_agent_returns_provider_error_three_times(
        self,
        mock_job_assistant_class,
        mock_build_jobs_queryset,
    ):
        mock_build_jobs_queryset.return_value = []

        mock_agent = mock_job_assistant_class.return_value
        mock_agent.search_job_params = AsyncMock(
            side_effect=[
                {"error": "AI service error.", "details": "500 Internal Server Error"},
                {"error": "AI service error.", "details": "500 Internal Server Error"},
                {"error": "AI service error.", "details": "500 Internal Server Error"},
            ]
        )

        with pytest.raises(ValidationError, match="There was an error while processing the data"):
            await get_jobs_by_agent_service("Python developer")

        assert mock_agent.search_job_params.await_count == 3
        for call in mock_agent.search_job_params.await_args_list:
            assert call.kwargs["errors"] is None
        mock_build_jobs_queryset.assert_not_called()