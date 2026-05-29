import pytest
from rest_framework.test import APIRequestFactory

from users.factories import CustomUserFactory
from users.models import CustomUser
from companies.models import Company
from jobs.models import JobPost
from jobs.choices import JobPostStatus, EmploymentTypes
from applications.models import Application

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

@pytest.fixture
def application_context(user, job):

    factory = APIRequestFactory()

    request = factory.post('/applications/create/')
    request.user = user

    return {
        "request": request,
        "job": job
    }

@pytest.fixture
def user():
    return CustomUser.objects.create_user(username="random_user",email="random_user@gmail.com",password="123456", role="dev")

@pytest.fixture
def company(user):
    return Company.objects.create(owner=user, name="random_company")

@pytest.fixture
def job(user,company):
    return JobPost.objects.create(posted_by=user,title="random_job",description="", company=company, location="random_location", status=JobPostStatus.ACTIVE, employment_type=EmploymentTypes.FULL_TIME, salary=100000)

@pytest.fixture
def user_2():
    return CustomUser.objects.create_user(username="random_user_2",email="random_user_2@gmail.com",password="123456", role="dev")


@pytest.fixture
def application(user, job):
    return Application.objects.create(applicant=user, job=job)

@pytest.fixture
def testing_withdraw_application(user_2, job):
    return Application.objects.create(applicant=user_2, job=job)



@pytest.fixture(scope="function")
def existing_test_user(django_db_blocker):
    with django_db_blocker.unblock():
        return CustomUser.objects.create_user(
            username="existing_user",
            email="random_user@outlook.com",
            password="somepassword"
        )

@pytest.fixture
def user_factory():
    return CustomUserFactory

@pytest.fixture
def login_serializer_valid_data():
    return {
        'username': 'testuser',
        'password': 'TestPass123!'
    }

@pytest.fixture
def login_serializer_invalid_data():
    return {
        'username': 'nonexistent',
        'password': 'WrongPassword'
    }
    
pytest_plugins =[
    "tests.fixtures.files",
    "tests.fixtures.auth",
    "tests.fixtures.jobs",
    "tests.fixtures.company",
    "tests.fixtures.applications",
    "tests.fixtures.users",
]