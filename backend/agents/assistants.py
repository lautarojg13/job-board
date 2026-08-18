from abc import ABC

from agents.agent_bridge import Agent
from agents.providers import get_agent

from agents.prompts import get_resume_analyzer_prompt, get_jobs_search_prompt



class JobAssistantAgent(Agent, ABC):
    def __init__(self, language="English", provider=None):
        super().__init__(language=language)
        self.provider = provider or get_agent(language=language)

    async def call_model(self, system_prompt, user_prompt, temperature=0.0):
        return await self.provider.call_model(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
        )

    async def analyze_resume_compatibility(self, resume_content, job_post_info, errors=None):
        system_prompt = get_resume_analyzer_prompt(self.language)

        user_prompt = f"Resume Content: {resume_content}\n\nJob Description: {job_post_info}"

        if errors:
            error_feedback = f"\n\nPrevious validation errors: {errors}. Please fix them."
            user_prompt = f"{user_prompt}{error_feedback}"

        return await self.call_model(system_prompt=system_prompt, user_prompt=user_prompt)

    async def search_job_params(self, user_prompt, errors=None):
        system_prompt = get_jobs_search_prompt(self.language)

        if errors:
            error_feedback = f"\n\nPrevious validation errors: {errors}. Please fix them."
            user_prompt = f"User input: {user_prompt}{error_feedback}"

        return await self.call_model(system_prompt=system_prompt, user_prompt=user_prompt)