from django.core.management.base import BaseCommand
from django.db import transaction

from companies.choices import CompanyRoleChoices
from companies.management.commands.seed_utils import build_seed_companies
from companies.models import Company, CompanyMember
from users.choices import UserRoleChoices
from users.management.commands.seed_utils import (
    SEED_USERNAME_PREFIX,
    build_seed_user,
    get_next_seed_username_index,
)
from users.models import CustomUser


class Command(BaseCommand):
    help = (
        "Seed companies, each with an OWNER user and a configurable number of "
        "RECRUITER members."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=10,
            type=int,
            help="Number of companies to create",
        )
        parser.add_argument(
            "--members-per-company",
            default=1,
            type=int,
            help="Number of RECRUITER members to add per company (besides the owner)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        total = options["total"]
        members_per_company = max(0, options["members_per_company"])

        if total <= 0:
            self.stdout.write("0 companies created")
            return

        username_index = get_next_seed_username_index()

        owners = [
            build_seed_user(
                f"{SEED_USERNAME_PREFIX}{username_index + i}",
                UserRoleChoices.USER,
            )
            for i in range(total)
        ]
        recruiters = [
            build_seed_user(
                f"{SEED_USERNAME_PREFIX}{username_index + total + i}",
                UserRoleChoices.USER,
            )
            for i in range(total * members_per_company)
        ]

        all_users = owners + recruiters
        CustomUser.objects.bulk_create(all_users)

        user_by_username = {
            user.username: user
            for user in CustomUser.objects.filter(
                username__in=[user.username for user in all_users]
            )
        }
        created_users = [user_by_username[user.username] for user in all_users]

        companies = build_seed_companies(total)
        Company.objects.bulk_create(companies)

        company_by_name = {
            company.name: company
            for company in Company.objects.filter(
                name__in=[company.name for company in companies]
            )
        }
        created_companies = [company_by_name[company.name] for company in companies]

        members = []
        for i, company in enumerate(created_companies):
            members.append(
                CompanyMember(
                    company=company,
                    user=created_users[i],
                    company_role=CompanyRoleChoices.OWNER,
                )
            )
            recruiter_base = total + i * members_per_company
            for j in range(members_per_company):
                members.append(
                    CompanyMember(
                        company=company,
                        user=created_users[recruiter_base + j],
                        company_role=CompanyRoleChoices.RECRUITER,
                    )
                )

        CompanyMember.objects.bulk_create(members)

        self.stdout.write(
            self.style.SUCCESS(
                f"{total} companies created "
                f"({members_per_company} recruiter(s) per company), "
                f"{len(created_users)} users created"
            )
        )
