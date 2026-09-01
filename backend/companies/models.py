from django.db import models
from users.models import CustomUser
from companies.choices import CompanyRoleChoices

# Create your models here.

class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True, unique=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    followers = models.ManyToManyField(CustomUser, related_name="followed_companies", blank=True)

    def __str__(self):
        return self.name
    

class CompanyMember(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='company_memberships'
    )
    company_role = models.CharField(
        max_length=50,
        choices=CompanyRoleChoices.choices,
        default=CompanyRoleChoices.RECRUITER
    )

    class Meta:
        unique_together = ('company', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.company.name} ({self.company_role})"
