from django.db import models
from jobs.choices import JobPostStatus

class JobPostQuerySet(models.QuerySet):
    def visible(self):
        return self.exclude(status=JobPostStatus.ARCHIVED).exclude(status=JobPostStatus.CLOSED)

    def filter_by_location(self, location):
        return self.filter(location__icontains=location)
    
    def filter_by_employment_type(self, employment_type):
        return self.filter(employment_type__icontains=employment_type)
    
    def filter_by_min_salary(self, min_salary):
        return self.filter(salary__gte=min_salary)