from unittest.mock import AsyncMock

import pytest

from agents.assistants import JobAssistantAgent


def make_agent(return_value=None):
    provider = AsyncMock()
    provider.call_model.return_value = return_value or {}
    return JobAssistantAgent(provider=provider)


class TestAnalyzeResumeCompatibility:
    @pytest.mark.asyncio
    async def test_calls_model_with_expected_prompts(self):
        agent = make_agent({"ok": True})

        await agent.analyze_resume_compatibility(
            resume_content="Resume",
            job_post_info="Job"
        )

        agent.provider.call_model.assert_awaited_once()

        kwargs = agent.provider.call_model.await_args.kwargs

        assert "Resume Content: Resume" in kwargs["user_prompt"]
        assert "Job Description: Job" in kwargs["user_prompt"]


class TestSearchJobParams:
    @pytest.mark.asyncio
    async def test_without_errors(self):
        agent = make_agent()

        await agent.search_job_params("Python developer")

        kwargs = agent.provider.call_model.await_args.kwargs

        assert kwargs["user_prompt"] == "Python developer"

    @pytest.mark.asyncio
    async def test_with_validation_errors(self):
        agent = make_agent()

        user_prompt = "Python remote developer"

        await agent.search_job_params(
            user_prompt=user_prompt,
            errors="location invalid"
        )

        kwargs = agent.provider.call_model.await_args.kwargs

        assert f"User input: {user_prompt}" in kwargs["user_prompt"]
        assert "Previous validation errors" in kwargs["user_prompt"]
