from celery import shared_task

from jobs.utils.info import get_job_post_info
from jobs.services import get_jobs_by_agent_service

from asgiref.sync import async_to_sync

from rest_framework.exceptions import ValidationError

from agents.assistants import JobAssistantAgent
from agents.serializers.output_serializers import ResumeAnalysisResultSerializer
from jobs.serializers import JobPostListSerializer

import logging

agents_logger = logging.getLogger("agents")

def _extract_validation_message(exc):
    """Return a plain readable message from a DRF ValidationError,
    avoiding the repr of the internal ErrorDetail objects."""
    detail = exc.detail

    if isinstance(detail, dict):
        parts = []
        for key, value in detail.items():
            if isinstance(value, (list, tuple)):
                value = value[0] if value else ""
            parts.append(f"{key}: {value}")
        return "; ".join(parts)

    if isinstance(detail, (list, tuple)):
        first = detail[0] if detail else ""
        return str(first) if first else str(exc)

    return str(detail)

@shared_task
def process_ai_search_task(user_prompt):
    try:
        results = async_to_sync(get_jobs_by_agent_service)(user_prompt)
        jobs_data = [JobPostListSerializer(job).data for job in results]
        agents_logger.debug(
            "Gotten %d jobs: %s",
            len(jobs_data),
            [(job["id"], job["title"]) for job in jobs_data],
        )
    except ValidationError as e:
        raise ValueError(_extract_validation_message(e))
    
    return jobs_data

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