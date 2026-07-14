import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from rest_framework.exceptions import ValidationError

from jobs.choices import EmploymentTypes
from jobs.services import analyze_resume_service, get_jobs_by_agent_service


class TestAnalyzeResumeService:

    @patch("jobs.services.JobAssistantAgent")
    @patch("jobs.services.extract_text_from_pdf")
    @patch("jobs.services.get_job_post_info")
    @pytest.mark.asyncio
    async def test_raises_when_resume_file_is_missing(
        self,
        mock_get_job_post_info,
        mock_extract_text_from_pdf,
        mock_job_assistant_class,
    ):
        mock_get_job_post_info.return_value = "Job post info"

        with pytest.raises(ValidationError, match="No resume file provided"):
            await analyze_resume_service(None, job_id=1)

        mock_get_job_post_info.assert_called_once_with(1)
        mock_extract_text_from_pdf.assert_not_called()
        mock_job_assistant_class.assert_not_called()

    @patch("jobs.services.JobAssistantAgent")
    @patch("jobs.services.extract_text_from_pdf")
    @patch("jobs.services.get_job_post_info")
    @pytest.mark.asyncio
    async def test_raises_when_resume_text_cannot_be_extracted(
        self,
        mock_get_job_post_info,
        mock_extract_text_from_pdf,
        mock_job_assistant_class,
    ):
        resume_file = MagicMock(name="resume_file")
        mock_get_job_post_info.return_value = "Job post info"
        mock_extract_text_from_pdf.return_value = ""

        with pytest.raises(ValidationError, match="Could not extract text from PDF"):
            await analyze_resume_service(resume_file, job_id=1)

        mock_get_job_post_info.assert_called_once_with(1)
        mock_extract_text_from_pdf.assert_called_once_with(resume_file)
        mock_job_assistant_class.assert_not_called()

    @patch("jobs.services.JobAssistantAgent")
    @patch("jobs.services.extract_text_from_pdf")
    @patch("jobs.services.get_job_post_info")
    @pytest.mark.asyncio
    async def test_raises_when_agent_returns_error(
        self,
        mock_get_job_post_info,
        mock_extract_text_from_pdf,
        mock_job_assistant_class,
    ):
        resume_file = MagicMock(name="resume_file")
        mock_get_job_post_info.return_value = "Job post info"
        mock_extract_text_from_pdf.return_value = "Resume content"

        mock_agent = mock_job_assistant_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            return_value={"error": "analysis failed"}
        )

        with pytest.raises(ValidationError):
            await analyze_resume_service(resume_file, job_id=1)

        mock_get_job_post_info.assert_called_once_with(1)
        mock_extract_text_from_pdf.assert_called_once_with(resume_file)
        mock_agent.analyze_resume_compatibility.assert_awaited_once_with(
            resume_content="Resume content",
            job_post_info="Job post info",
        )

    @patch("jobs.services.JobAssistantAgent")
    @patch("jobs.services.extract_text_from_pdf")
    @patch("jobs.services.get_job_post_info")
    @pytest.mark.asyncio
    async def test_returns_analysis_when_resume_is_valid(
        self,
        mock_get_job_post_info,
        mock_extract_text_from_pdf,
        mock_job_assistant_class,
    ):
        resume_file = MagicMock(name="resume_file")
        analysis_result = {
            "score": 92,
            "recommendation": "good match",
        }

        mock_get_job_post_info.return_value = "Job post info"
        mock_extract_text_from_pdf.return_value = "Resume content"

        mock_agent = mock_job_assistant_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            return_value=analysis_result
        )

        result = await analyze_resume_service(resume_file, job_id=1)

        assert result == analysis_result
        mock_get_job_post_info.assert_called_once_with(1)
        mock_extract_text_from_pdf.assert_called_once_with(resume_file)
        mock_agent.analyze_resume_compatibility.assert_awaited_once_with(
            resume_content="Resume content",
            job_post_info="Job post info",
        )


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