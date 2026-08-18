from celery import shared_task

from jobs.utils.info import get_job_post_info
from jobs.services import get_jobs_by_agent_service

from asgiref.sync import async_to_sync

from agents.assistants import JobAssistantAgent
from agents.serializers.output_serializers import ResumeAnalysisResultSerializer
from jobs.serializers import JobPostListSerializer

@shared_task
def process_ai_search_task(user_prompt):
    results = async_to_sync(get_jobs_by_agent_service)(user_prompt)
    return [JobPostListSerializer(job).data for job in results]

@shared_task
def analyze_resume_task(job_id, resume_text):
    job_post_info = get_job_post_info(job_id)
    
    agent = JobAssistantAgent()
    last_errors = None
    attempt = 0
    while attempt < 3:
        analysis = async_to_sync(agent.analyze_resume_compatibility)(
            resume_content=resume_text,
            job_post_info=job_post_info,
            errors=last_errors,
        )
        if analysis.get("error"):
            last_errors = None
            attempt += 1
            if attempt >= 3:
                raise ValueError(f"AI service error after 3 attempts: {analysis.get('details')}")
            continue
        serializer = ResumeAnalysisResultSerializer(data=analysis)
        if serializer.is_valid():
            return serializer.validated_data
        last_errors = serializer.errors
        attempt += 1
    raise ValueError(f"AI returned an invalid resume analysis after 3 attempts: {last_errors}")