from rest_framework.exceptions import ValidationError
from django.db.models import Q

from .utils.pdf_handler import extract_text_from_pdf
from .utils.info import get_job_post_info

from jobs.models import JobPost

from agent.agent_bridge import Agent
from agent.serializers.output_serializers import JobParamsResponseSerializer


def analyze_resume_service(resume_file, job_id):
    job_post_info = get_job_post_info(job_id)
    
    if not resume_file:
        raise ValidationError("No resume file provided")

    resume_content = extract_text_from_pdf(resume_file)
    if not resume_content:
        raise ValidationError("Could not extract text from PDF")

    agent = Agent()
    analysis = agent.analyze_resume_compatibility(
        resume_content=resume_content,
        job_post_info=job_post_info
    )

    if "error" in analysis:
        raise ValidationError(analysis)
    
    return analysis

def get_jobs_by_agent_service(user_prompt):
    agent = Agent()
    last_errors = None
    attempt = 0
    
    while attempt < 3:
        params = agent.search_job_params(user_prompt, errors=last_errors)
        serializer = JobParamsResponseSerializer(data=params)
        
        if serializer.is_valid():
            break
        
        last_errors = serializer.errors
        attempt += 1
    
    if not serializer.is_valid():
        raise ValidationError("There was an error while processing the data")
    
    valid_data = serializer.validated_data

    queryset = JobPost.objects.all()

    query = Q()

    for keyword in valid_data.get('keywords', []):
        query |= (
            Q(title__icontains=keyword) |
            Q(description__icontains=keyword)
        )
    queryset = queryset.filter(query)

    if valid_data.get('location'):
        queryset = queryset.filter(
            location__icontains=valid_data['location']
        )

    if valid_data.get('employment_type') is not None:
        queryset = queryset.filter(
            employment_type=valid_data['employment_type']
        )

    if valid_data.get('min_salary'):
        queryset = queryset.filter(
            salary__gte=valid_data['min_salary']
        )

    return queryset