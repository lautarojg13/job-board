from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import CompanyMember
from .choices import CompanyRoleChoices


class IsCompanyOwner(BasePermission):
    message = "Only the company owner can modify this company"

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return CompanyMember.objects.filter(
            company=obj,
            user=request.user,
            company_role=CompanyRoleChoices.OWNER
        ).exists()