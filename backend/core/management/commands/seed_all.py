from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Populate the whole app with a comfortable amount of seed data in one shot "
        "(users, companies, jobs, applications). Run after cloning the repo."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--admins",
            default=2,
            type=int,
            help="Number of admin users to create",
        )
        parser.add_argument(
            "--common-users",
            default=20,
            type=int,
            help="Number of common users to create (job seekers)",
        )
        parser.add_argument(
            "--companies",
            default=10,
            type=int,
            help="Number of companies to create",
        )
        parser.add_argument(
            "--members-per-company",
            default=1,
            type=int,
            help="Number of RECRUITER members to add per company",
        )
        parser.add_argument(
            "--jobs",
            default=30,
            type=int,
            help="Number of job posts to create",
        )
        parser.add_argument(
            "--applications",
            default=50,
            type=int,
            help="Number of job applications to create",
        )
        parser.add_argument(
            "--responses-per-application",
            default=1,
            type=int,
            help="Number of ApplicationResponse rows to add per application",
        )

    def handle(self, *args, **options):
        admins = max(0, options["admins"])
        common_users = max(0, options["common_users"])
        companies = max(0, options["companies"])
        members_per_company = max(0, options["members_per_company"])
        jobs = max(0, options["jobs"])
        applications = max(0, options["applications"])
        responses_per_application = max(0, options["responses_per_application"])

        if admins > 0 or common_users > 0:
            call_command(
                "seed_users",
                admins=admins,
                common_users=common_users,
            )

        if companies > 0:
            call_command(
                "seed_companies",
                total=companies,
                members_per_company=members_per_company,
            )

        if jobs > 0:
            call_command("seed_jobs", total=jobs)

        if applications > 0:
            call_command(
                "seed_applications",
                total=applications,
                responses_per_application=responses_per_application,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: {admins} admins, {common_users} common users, "
                f"{companies} companies, {jobs} jobs, {applications} applications "
                f"({responses_per_application} response(s) each)"
            )
        )