from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from companies.choices import CompanyRoleChoices
from companies.models import Company, CompanyMember
from jobs.management.commands.seed_utils import build_seed_job
from jobs.models import JobPost
from users.choices import UserRoleChoices
from users.management.commands.seed_utils import (
    SEED_USERNAME_PREFIX,
    build_seed_user,
    get_next_seed_username_index,
)


class Command(BaseCommand):
    help = (
        "Seed job posts distributed across existing companies. If no company "
        "exists, a minimal set is created via seed_companies first."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=20,
            type=int,
            help="Number of job posts to create",
        )

    def _resolve_posters(self, companies):
        posters = {}
        for company in companies:
            member = (
                CompanyMember.objects.filter(company=company)
                .select_related("user")
                .order_by("-company_role")
                .first()
            )
            if member:
                posters[company.pk] = member.user
                continue

            username_index = get_next_seed_username_index()
            owner = build_seed_user(
                f"{SEED_USERNAME_PREFIX}{username_index}",
                UserRoleChoices.USER,
            )
            owner.save()
            CompanyMember.objects.create(
                company=company,
                user=owner,
                company_role=CompanyRoleChoices.OWNER,
            )
            posters[company.pk] = owner

        return posters

    @transaction.atomic
    def handle(self, *args, **options):
        total = options["total"]

        if total <= 0:
            self.stdout.write("0 job posts created")
            return

        companies = list(Company.objects.all())
        if not companies:
            call_command("seed_companies", total=min(total, 5))
            companies = list(Company.objects.all())

        if not companies:
            self.stdout.write(self.style.ERROR("No companies available to seed jobs"))
            return

        poster_by_company = self._resolve_posters(companies)

        jobs = []
        for i in range(total):
            company = companies[i % len(companies)]
            jobs.append(build_seed_job(company, poster_by_company[company.pk]))

        JobPost.all_objects.bulk_create(jobs)

        self.stdout.write(
            self.style.SUCCESS(f"{total} job posts created across {len(companies)} companies")
        )