from rest_framework.permissions import BasePermission
from companies.models import CompanyMember
from companies.choices import CompanyRoleChoices
from .models import JobPost


class IsJobOwner(BasePermission):
    message = "You are not allowed to perform this action"

    def has_object_permission(self, request, view, obj):
        if obj.posted_by == request.user:
            return True
        return CompanyMember.objects.filter(
            company=obj.company,
            user=request.user,
            company_role=CompanyRoleChoices.OWNER
        ).exists()