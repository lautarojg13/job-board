import pytest

from companies.choices import CompanyRoleChoices
from companies.models import Company, CompanyMember

@pytest.fixture
def company(user):
    comp = Company.objects.create(name="random_company")
    CompanyMember.objects.create(
        company=comp,
        user=user,
        company_role=CompanyRoleChoices.OWNER
    )
    return comp