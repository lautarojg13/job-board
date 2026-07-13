from applications.exceptions import ForbiddenApplicationStatusUpdate, TryingToApplyToOwnJob, ApplicationAlreadyExists, InvalidUpdateStatus, JobNotAvailable
from applications.models import Application, ApplicationResponse, ApplicationStatus

from rest_framework.exceptions import PermissionDenied

from jobs.choices import JobPostStatus

from core.emails import send_email_task

def apply_to_job_service(user, job, **application_data):

    if Application.objects.filter(applicant=user, job=job).exists():
        raise ApplicationAlreadyExists("You already applied this job")

    if user == job.posted_by:
        raise TryingToApplyToOwnJob("You cannot apply your own job")

    if job.status != JobPostStatus.ACTIVE:
        raise JobNotAvailable("You cannot apply to a job that is not active")
    
    send_email_task.delay(
        subject="Application Confirmation",
        message=f"You have successfully applied to: {job.title}",
        recipient_list=[user.email],
    )
    
    return Application.objects.create(
        applicant=user,
        job=job,
        **application_data
    )

def respond_to_application_service(application, responder, status, message=None):
    if application.job.posted_by != responder:
        raise ForbiddenApplicationStatusUpdate()

    if status not in [value for value in ApplicationStatus.values if value != "pending"]:
        raise InvalidUpdateStatus()

    application.status = status
    application.save()

    return ApplicationResponse.objects.create(
        application=application,
        responder=responder,
        message=message,
    )

def withdraw_application_service(user, application):
    if application.applicant != user:
        raise PermissionDenied("You cannot withdraw an application that is not yours")

    application.status = "withdrawn"
    application.save()

    return application