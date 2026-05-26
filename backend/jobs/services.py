from rest_framework.exceptions import ValidationError

from .utils.pdf_handler import extract_text_from_pdf
from .utils.info import get_job_post_info
from .utils.asyncronous.querysets import build_jobs_queryset

from asgiref.sync import sync_to_async

from agent.assistants import JobAssistantAgent
from agent.serializers.output_serializers import JobParamsResponseSerializer


async def analyze_resume_service(resume_file, job_id):
    job_post_info = await sync_to_async(get_job_post_info)(job_id)
    
    if not resume_file:
        raise ValidationError("No resume file provided")

    resume_content = extract_text_from_pdf(resume_file)
    if not resume_content:
        raise ValidationError("Could not extract text from PDF")

    agent = JobAssistantAgent()
    analysis = await agent.analyze_resume_compatibility(
        resume_content=resume_content,
        job_post_info=job_post_info
    )

    if "error" in analysis:
        raise ValidationError(analysis)
    
    return analysis

async def get_jobs_by_agent_service(user_prompt):
    agent = JobAssistantAgent()
    last_errors = None
    attempt = 0
    
    while attempt < 3:
        params = await agent.search_job_params(user_prompt, errors=last_errors)
        serializer = JobParamsResponseSerializer(data=params)
        
        if serializer.is_valid():
            break
        
        last_errors = serializer.errors
        attempt += 1
    
    if not serializer.is_valid():
        raise ValidationError("There was an error while processing the data")
    
    valid_data = serializer.validated_data

    queryset = await sync_to_async(list)(build_jobs_queryset(valid_data))

    return queryset