from rest_framework.exceptions import ValidationError

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
    
    params = agent.search_job_params(user_prompt)
    
    serializer = JobParamsResponseSerializer(data=params)
    serializer.is_valid(raise_exception=True)
    valid_data = serializer.validated_data
    
    query = """
        SELECT * FROM jobs_jobpost 
        WHERE status = 'active'
    """
    query_params = []

    if valid_data.get('keywords'):
        query += " AND (title LIKE %s OR description LIKE %s)"
        like_val = f"%{valid_data['keywords']}%"
        query_params.extend([like_val, like_val])

    if valid_data.get('location'):
        query += " AND location LIKE %s"
        query_params.append(f"%{valid_data['location']}%")

    if valid_data.get('remote') is not None:
        query += " AND remote = %s"
        query_params.append(valid_data['remote'])

    if valid_data.get('min_salary'):
        query += " AND salary >= %s"
        query_params.append(valid_data['min_salary'])
    
    return JobPost.objects.raw(query, query_params)