"""Seed a verified test user, company and sample job for the Playwright E2E suite.

Credentials (used by `frontend/e2e/users.ts`):

    e2e-seeker@jobboard.test   / E2ePass123!   (job seeker)
    e2e-employer@jobboard.test / E2ePass123!   (owner of "E2E Employer Co")

Run:
    backend/env/bin/python manage.py make_test_user
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from allauth.account.models import EmailAddress

from companies.choices import CompanyRoleChoices
from companies.models import Company, CompanyMember
from jobs.choices import EmploymentTypes, JobPostStatus, WorkModeChoices
from jobs.models import JobPost
from users.models import CustomUser

SEEKER_EMAIL = "e2e-seeker@jobboard.test"
EMPLOYER_EMAIL = "e2e-employer@jobboard.test"
E2E_PASSWORD = "E2ePass123!"
COMPANY_NAME = "E2E Employer Co"
SAMPLE_JOB_TITLE = "E2E Sample Backend Engineer"


def _get_or_create_verified_user(email):
    user, created = CustomUser.objects.get_or_create(
        username=email,
        defaults={
            "email": email,
            "is_active": True,
        },
    )
    user.email = email
    user.is_active = True
    user.set_password(E2E_PASSWORD)
    user.save()

    EmailAddress.objects.get_or_create(
        user=user,
        email=email,
        defaults={"verified": True, "primary": True},
    )

    return user


class Command(BaseCommand):
    help = "Create the seeded users/company/job used by the Playwright E2E suite."

    @transaction.atomic
    def handle(self, *args, **options):
        seeker = _get_or_create_verified_user(SEEKER_EMAIL)
        employer = _get_or_create_verified_user(EMPLOYER_EMAIL)

        company, _ = Company.objects.get_or_create(
            name=COMPANY_NAME,
            defaults={
                "description": "E2E company used by the Playwright test suite.",
            },
        )

        CompanyMember.objects.get_or_create(
            company=company,
            user=employer,
            defaults={"company_role": CompanyRoleChoices.OWNER},
        )

        JobPost.objects.get_or_create(
            title=SAMPLE_JOB_TITLE,
            defaults={
                "company": company,
                "description": (
                    "Sample backend role created by make_test_user for E2E tests."
                ),
                "location": "Remote",
                "work_mode": WorkModeChoices.REMOTE,
                "status": JobPostStatus.ACTIVE,
                "employment_type": EmploymentTypes.FULL_TIME,
                "salary": 100000,
                "posted_by": employer,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"E2E seed ready: seeker={SEEKER_EMAIL}, employer={EMPLOYER_EMAIL}, "
                f"company={COMPANY_NAME}, job={SAMPLE_JOB_TITLE}"
            )
        )