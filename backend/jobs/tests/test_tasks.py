from unittest.mock import AsyncMock, patch

from jobs.tasks import analyze_resume_task, process_ai_search_task


class TestProcessAiSearchTask:

    @patch("jobs.tasks.get_jobs_by_agent_service")
    def test_returns_service_result(self, mock_service):
        mock_service.return_value = [{"id": 1, "title": "Python Dev"}]

        result = process_ai_search_task("Python developer")

        assert result == [{"id": 1, "title": "Python Dev"}]
        mock_service.assert_awaited_once_with("Python developer")


class TestAnalyzeResumeTask:

    @patch("jobs.tasks.JobAssistantAgent")
    @patch("jobs.tasks.get_job_post_info")
    def test_returns_agent_analysis(self, mock_get_job_post_info, mock_agent_class):
        mock_get_job_post_info.return_value = "Job description here"
        mock_agent = mock_agent_class.return_value
        mock_agent.analyze_resume_compatibility = AsyncMock(
            return_value={"score": 90, "recommendation": "good match"}
        )

        result = analyze_resume_task(42, "Resume text")

        assert result == {"score": 90, "recommendation": "good match"}
        mock_agent_class.assert_called_once_with()
        mock_get_job_post_info.assert_called_once_with(42)
        mock_agent.analyze_resume_compatibility.assert_awaited_once_with(
            resume_content="Resume text",
            job_post_info="Job description here",
        )