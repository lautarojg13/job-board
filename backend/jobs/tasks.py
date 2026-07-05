from celery import shared_task

from jobs.utils.info import get_job_post_info
from jobs.services import get_jobs_by_agent_service

from asgiref.sync import async_to_sync

from agents.assistants import JobAssistantAgent

@shared_task
def process_ai_search_task(user_prompt):
    return async_to_sync(get_jobs_by_agent_service)(user_prompt)

@shared_task
def analyze_resume_task(job_id, resume_text):
    job_post_info = get_job_post_info(job_id)
    
    agent = JobAssistantAgent()
    analysis = async_to_sync(agent.analyze_resume_compatibility)(resume_content=resume_text, job_post_info=job_post_info)
    
    return analysis