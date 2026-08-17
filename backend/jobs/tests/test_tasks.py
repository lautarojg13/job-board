from unittest.mock import AsyncMock, patch

from jobs.tasks import analyze_resume_task, process_ai_search_task


class TestProcessAiSearchTask:

    @patch("jobs.tasks.get_jobs_by_agent_service")
    def test_returns_service_result(self, mock_service):
        user_prompt = "Python developer"
        expected_result = [{"id": 1, "title": "Python Dev"}]
        mock_service.return_value = expected_result

        result = process_ai_search_task(user_prompt)

        assert result == expected_result
        mock_service.assert_awaited_once_with(user_prompt)


class TestAnalyzeResumeTask:

    @patch("jobs.tasks.JobAssistantAgent")
    @patch("jobs.tasks.get_job_post_info")
    def test_returns_agent_analysis(self, mock_get_job_post_info, mock_agent_class):
        job_id = 42
        resume_text = "Resume text"
        job_description = "Job description here"
        expected_analysis = {"score": 90, "recommendation": "good match"}

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
        )