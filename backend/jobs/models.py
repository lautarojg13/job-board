from django.db import models
from users.models import CustomUser

from companies.models import Company

from jobs.managers import JobPostManager

from jobs.choices import JobPostStatus, EmploymentTypes, WorkModeChoices

# Create your models here.

class JobPost(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    
    company = models.ForeignKey(Company,on_delete = models.CASCADE, related_name="jobs", null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    work_mode = models.CharField(
        max_length=20,
        choices=WorkModeChoices.choices,
        default=WorkModeChoices.ONSITE
    )
    
    
    status = models.CharField(
        max_length=20,
        choices=JobPostStatus.choices,
        default=JobPostStatus.ACTIVE
    )
    
    employment_type = models.CharField(
        max_length=2,
        choices= EmploymentTypes.choices,
        default=EmploymentTypes.FULL_TIME
    )
    
    salary = models.PositiveIntegerField(null=True, blank=True)

    posted_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    applicants = models.ManyToManyField(CustomUser, through="applications.Application", related_name="applied_jobs")
    
    objects = JobPostManager()
    all_objects = models.Manager()

    def __str__(self):
        return f"{self.title} - {self.company or self.posted_by.username}"