from django.db import models
from jobs.querysets import JobPostQuerySet

class JobPostManager(models.Manager.from_queryset(JobPostQuerySet)):
    def get_queryset(self):
        return super().get_queryset().visible_to_users()