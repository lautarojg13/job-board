import factory

from factory.django import DjangoModelFactory

from companies.models import Company, CompanyMember
from companies.choices import CompanyRoleChoices
from users.factories import CustomUserFactory


class CompanyFactory(DjangoModelFactory):
    class Meta:
        model = Company
        skip_postgeneration_save = True
    
    name = factory.Sequence(lambda n: f'Company {n}')

    @factory.post_generation
    def set_owner(obj, create, extracted, **kwargs):
        if create:
            owner = extracted or CustomUserFactory()
            CompanyMember.objects.create(
                company=obj,
                user=owner,
                company_role=CompanyRoleChoices.OWNER
            )


class CompanyMemberFactory(DjangoModelFactory):
    class Meta:
        model = CompanyMember

    company = factory.SubFactory(CompanyFactory)
    user = factory.SubFactory(CustomUserFactory)
    company_role = CompanyRoleChoices.RECRUITER