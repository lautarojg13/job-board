from django.db import models

class UserRoleChoices(models.TextChoices):
    DEVELOPER = 'DEVELOPER', 'Developer'
    RECRUITER = 'RECRUITER', 'Recruiter / Company'
    ADMIN = 'ADMIN', 'System admin'