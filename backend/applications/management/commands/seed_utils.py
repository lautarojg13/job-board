import io
import itertools

from django.core.files.uploadedfile import SimpleUploadedFile

from faker import Faker

from pypdf import PdfWriter

from applications.choices import ApplicationStatus
from applications.models import Application


fake = Faker()

statuses = itertools.cycle(
    [
        ApplicationStatus.PENDING,
        ApplicationStatus.PENDING,
        ApplicationStatus.REVIEWED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
    ]
)


def make_resume_pdf():
    buffer = io.BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    writer.write(buffer)
    return SimpleUploadedFile(
        "resume.pdf",
        buffer.getvalue(),
        content_type="application/pdf",
    )


def build_seed_application(applicant, job):
    return Application(
        applicant=applicant,
        job=job,
        resume=make_resume_pdf(),
        cover_letter=fake.text(),
        status=next(statuses),
    )