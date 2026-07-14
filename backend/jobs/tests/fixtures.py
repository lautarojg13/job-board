import pytest

from jobs.choices import EmploymentTypes, JobPostStatus
from jobs.models import JobPost

from rest_framework.test import APIRequestFactory

@pytest.fixture
def job(user,company):
    return JobPost.objects.create(posted_by=user,title="random_job",description="", company=company, location="random_location", status=JobPostStatus.ACTIVE, employment_type=EmploymentTypes.FULL_TIME, salary=100000)

@pytest.fixture
def valid_job_post_data(company, user):
    return {
        'title': 'Software Engineer',
        'description': 'We are hiring',
        'posted_by': user.id,
        'company': company.id,
        'location': 'New York',
        'status': JobPostStatus.ACTIVE,
        'employment_type': EmploymentTypes.FULL_TIME,
        'salary': 120000,
    }
    
    
@pytest.fixture
def authenticated_request(user):

    factory = APIRequestFactory()

    def make_request(data=None):

        request = factory.post('/jobs/list/', data or {})

        request.user = user

        return request

    return make_request