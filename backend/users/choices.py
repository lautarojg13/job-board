from django.db import models

class UserRoleChoices(models.TextChoices):
    DEV = 'dev', 'Developer'
    ADMIN = 'admin', 'Admin'
    