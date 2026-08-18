import pytest
from unittest.mock import AsyncMock, patch

from jobs.serializers import JobPostListSerializer
from jobs.tasks import analyze_resume_task, process_ai_search_task


class TestProcessAiSearchTask:

    @patch("jobs.tasks.get_jobs_by_agent_service")
    @pytest.mark.django_db
    def test_serializes_service_result(self, mock_service, job):
        user_prompt = "Python developer"
        mock_service.return_value = [job]

        result = process_ai_search_task(user_prompt)

        assert result == [JobPostListSerializer(job).data]
        mock_service.assert_awaited_once_with(user_prompt)

    @patch("jobs.tasks.get_jobs_by_agent_service")
    def test_returns_empty_list_when_no_jobs(self, mock_service):
        user_prompt = "Python developer"
        mock_service.return_value = []

        result = process_ai_search_task(user_prompt)

        assert result == []
        mock_service.assert_awaited_once_with(user_prompt)


class TestAnalyzeResumeTask:

    @patch("jobs.tasks.JobAssistantAgent")
    @patch("jobs.tasks.get_job_post_info")
    def test_returns_agent_analysis(self, mock_get_job_post_info, mock_agent_class):
        job_id = 42
        resume_text = "Resume text"
        job_description = "Job description here"
        expected_analysis = {
            "match_percentage": 85,
            "matching_skills": ["Python", "Django"],
            "missing_skills": ["AWS"],
            "summary": "Strong match",
        }

        mock_get_job_post_info.return_value = job_description
        mock_agent = mock_agent_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            return_value=expected_analysis
        )

        result = analyze_resume_task(job_id, resume_text)

        assert result == expected_analysis
        mock_agent_class.assert_called_once_with()
        mock_get_job_post_info.assert_called_once_with(job_id)
        mock_agent.analyze_resume_compatibility.assert_awaited_once_with(
            resume_content=resume_text,
            job_post_info=job_description,
            errors=None,
        )

    @patch("jobs.tasks.JobAssistantAgent")
    @patch("jobs.tasks.get_job_post_info")
    def test_retries_with_error_feedback_then_succeeds(
        self, mock_get_job_post_info, mock_agent_class
    ):
        mock_get_job_post_info.return_value = "Job description here"
        mock_agent = mock_agent_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            side_effect=[
                {"match_percentage": 150},
                {
                    "match_percentage": 80,
                    "matching_skills": [],
                    "missing_skills": [],
                    "summary": "",
                },
            ]
        )

        result = analyze_resume_task(42, "Resume text")

        assert result["match_percentage"] == 80
        assert mock_agent.analyze_resume_compatibility.await_count == 2

        first_kwargs = mock_agent.analyze_resume_compatibility.await_args_list[0].kwargs
        second_kwargs = mock_agent.analyze_resume_compatibility.await_args_list[1].kwargs

        assert first_kwargs["errors"] is None
        assert "match_percentage" in second_kwargs["errors"]

    @patch("jobs.tasks.JobAssistantAgent")
    @patch("jobs.tasks.get_job_post_info")
    def test_raises_when_output_invalid_three_times(
        self, mock_get_job_post_info, mock_agent_class
    ):
        mock_get_job_post_info.return_value = "Job description here"
        mock_agent = mock_agent_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            return_value={"match_percentage": 150}
        )

        with pytest.raises(ValueError, match="invalid resume analysis after 3 attempts"):
            analyze_resume_task(42, "Resume text")

        assert mock_agent.analyze_resume_compatibility.await_count == 3

    @patch("jobs.tasks.JobAssistantAgent")
    @patch("jobs.tasks.get_job_post_info")
    def test_raises_when_provider_fails_three_times(
        self, mock_get_job_post_info, mock_agent_class
    ):
        mock_get_job_post_info.return_value = "Job description here"
        mock_agent = mock_agent_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            return_value={
                "error": "AI service error.",
                "details": "500 Internal Server Error",
            }
        )

        with pytest.raises(ValueError, match="AI service error after 3 attempts"):
            analyze_resume_task(42, "Resume text")

        assert mock_agent.analyze_resume_compatibility.await_count == 3
        for call in mock_agent.analyze_resume_compatibility.await_args_list:
            assert call.kwargs["errors"] is None