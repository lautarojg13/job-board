from .agent_bridge import Agent

from .prompts import get_resume_analyzer_prompt, get_jobs_search_prompt

class JobAssistantAgent(Agent):
    def analyze_resume_compatibility(self, resume_content, job_post_info):
        system_prompt = get_resume_analyzer_prompt(self.language)
        
        user_prompt = f"Resume Content: {resume_content}\n\nJob Description: {job_post_info}"
        
        return self.call_model(system_prompt=system_prompt, user_prompt=user_prompt)
    
    def search_job_params(self, user_prompt, errors=None):
        system_prompt = get_jobs_search_prompt(self.language)
        
        if errors:
            error_feedback = f"\n\nPrevious validation errors: {errors}. Please fix them."
            user_prompt = f"User input: {user_prompt}{error_feedback}"
            
        return self.call_model(system_prompt, user_prompt)
        