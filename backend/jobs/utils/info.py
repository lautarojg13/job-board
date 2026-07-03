from jobs.models import JobPost
from django.shortcuts import get_object_or_404

def get_job_post_info(job_id):
        
    job_post = get_object_or_404(JobPost, id=job_id)
    return job_post.description