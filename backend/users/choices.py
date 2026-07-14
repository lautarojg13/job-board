from django.db import models

class UserRoleChoices(models.TextChoices):
    USER = 'USER', 'User'
    ADMIN = 'ADMIN', 'System admin'