from unittest.mock import AsyncMock

import pytest

from agents.assistants import JobAssistantAgent


class DummyAssistant(JobAssistantAgent):
    pass


class TestAnalyzeResumeCompatibility:
    @pytest.mark.asyncio
    async def test_calls_model_with_expected_prompts(self):
        agent = DummyAssistant()

        agent.call_model = AsyncMock(return_value={"ok": True})

        await agent.analyze_resume_compatibility(
            resume_content="Resume",
            job_post_info="Job"
        )

        agent.call_model.assert_awaited_once()

        kwargs = agent.call_model.await_args.kwargs

        assert "Resume Content: Resume" in kwargs["user_prompt"]
        assert "Job Description: Job" in kwargs["user_prompt"]


class TestSearchJobParams:
    @pytest.mark.asyncio
    async def test_without_errors(self):
        agent = DummyAssistant()

        agent.call_model = AsyncMock(return_value={})

        await agent.search_job_params("Python developer")

        kwargs = agent.call_model.await_args.kwargs

        assert kwargs["user_prompt"] == "Python developer"

    @pytest.mark.asyncio
    async def test_with_validation_errors(self):
        agent = DummyAssistant()

        agent.call_model = AsyncMock(return_value={})

        user_prompt = "Python remote developer"

        await agent.search_job_params(
            user_prompt=user_prompt,
            errors="location invalid"
        )

        kwargs = agent.call_model.await_args.kwargs

        assert f"User input: {user_prompt}" in kwargs["user_prompt"]
        assert "Previous validation errors" in kwargs["user_prompt"]