from django.db import models

from applications.validators.resume import RESUME_VALIDATORS

from users.models import CustomUser
from jobs.models import JobPost
from applications.choices import ApplicationStatus



# Create your models here.


class Application(models.Model):
    applicant = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", validators=RESUME_VALIDATORS)
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = models.Manager()

    class Meta:
        unique_together = ("applicant", "job")

class ApplicationResponse(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="responses")
    responder = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.responder.username} application response"