from factory import SubFactory, LazyAttribute
from factory.django import DjangoModelFactory

from django.core.files.uploadedfile import SimpleUploadedFile

from applications.models import Application, ApplicationResponse

from users.factories import CustomUserFactory
from jobs.factories import JobPostFactory


class ApplicationFactory(DjangoModelFactory):
    class Meta:
        model = Application

    job = SubFactory(JobPostFactory)
    applicant = SubFactory(CustomUserFactory)
    resume = LazyAttribute(
        lambda _: SimpleUploadedFile(
            "resume.pdf",
            b"Fake PDF content",
            content_type="application/pdf"
        )
    )
    
class ApplicationResponseFactory(DjangoModelFactory):
    class Meta:
        model = ApplicationResponse
        
    application = SubFactory(ApplicationFactory)
    responder = SubFactory(CustomUserFactory)
    message = "This is a response message."
    