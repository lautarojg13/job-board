from django.db import models
from django.contrib.auth.models import AbstractUser

from users.choices import UserRoleChoices

# Create your models here.

class CustomUser(AbstractUser):
    
    email = models.EmailField(unique=True, blank=False, null=False)
    role = models.CharField(max_length=20, choices=UserRoleChoices.choices, default=UserRoleChoices.CANDIDATE)