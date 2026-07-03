from celery import shared_task

from jobs.services import get_jobs_by_agent_service

from asgiref.sync import async_to_sync

@shared_task
def process_ai_search(user_prompt):
    return async_to_sync(get_jobs_by_agent_service)(user_prompt)