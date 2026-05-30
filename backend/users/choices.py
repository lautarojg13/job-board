from django.db import models

class UserRoleChoices(models.TextChoices):
    CANDIDATE = 'CANDIDATE', 'Candidate'
    RECRUITER = 'RECRUITER', 'Recruiter / Company'
    ADMIN = 'ADMIN', 'System admin'