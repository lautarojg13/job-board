import pytest
from applications.models import Application

from rest_framework.test import APIRequestFactory

@pytest.fixture
def application(user, job):
    return Application.objects.create(applicant=user, job=job)

@pytest.fixture
def testing_withdraw_application(user_2, job):
    return Application.objects.create(applicant=user_2, job=job)


@pytest.fixture
def application_context(user, job):

    factory = APIRequestFactory()

    request = factory.post('/applications/create/')
    request.user = user

    return {
        "request": request,
        "job": job
    }