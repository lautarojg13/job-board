from django.db import models

class CompanyRoleChoices(models.TextChoices):
    OWNER = 'OWNER', 'Owner'
    RECRUITER = 'RECRUITER', 'Recruiter'