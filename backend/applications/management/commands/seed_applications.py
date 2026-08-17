from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from applications.management.commands.seed_utils import (
    build_seed_application,
    fake,
)
from applications.models import Application, ApplicationResponse
from companies.models import CompanyMember
from jobs.choices import JobPostStatus
from jobs.models import JobPost
from users.models import CustomUser


class Command(BaseCommand):
    help = (
        "Seed job applications (seekers -> active jobs) with optional "
        "ApplicationResponse rows. Creates dependencies (seekers/jobs) if missing."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=30,
            type=int,
            help="Number of applications to create",
        )
        parser.add_argument(
            "--responses-per-application",
            default=0,
            type=int,
            help="Number of ApplicationResponse rows to add per application (0 = none)",
        )

    def _ensure_seekers(self, total):
        seekers = list(CustomUser.objects.filter(company_memberships__isnull=True))
        if not seekers:
            call_command("seed_common_users", total=min(total, 5))
            seekers = list(CustomUser.objects.filter(company_memberships__isnull=True))
        return seekers

    def _ensure_active_jobs(self, total):
        jobs = list(JobPost.objects.filter(status=JobPostStatus.ACTIVE))
        if not jobs:
            call_command("seed_jobs", total=min(total, 10))
            jobs = list(JobPost.objects.filter(status=JobPostStatus.ACTIVE))
        return jobs

    def _pick_responder(self, application, excluded_ids):
        job = application.job

        candidates = []
        if job.company_id:
            candidates.extend(
                CompanyMember.objects.filter(company_id=job.company_id)
                .select_related("user")
                .order_by("-company_role")
                .values_list("user_id", flat=True)
            )
        if job.posted_by_id:
            candidates.append(job.posted_by_id)

        seen = set(excluded_ids)
        for user_id in candidates:
            if user_id not in seen:
                return user_id

        other_member = (
            CompanyMember.objects.exclude(user_id__in=excluded_ids)
            .order_by("pk")
            .values_list("user_id", flat=True)
            .first()
        )
        if other_member:
            return other_member

        fallback = (
            CustomUser.objects.exclude(pk__in=excluded_ids)
            .order_by("pk")
            .first()
        )
        return fallback.pk if fallback else None

    @transaction.atomic
    def handle(self, *args, **options):
        total = options["total"]
        responses_per_application = max(0, options["responses_per_application"])

        if total <= 0:
            self.stdout.write("0 applications created")
            return

        seekers = self._ensure_seekers(total)
        jobs = self._ensure_active_jobs(total)

        if not seekers or not jobs:
            self.stdout.write(
                self.style.ERROR("Cannot seed applications: no seekers or active jobs available")
            )
            return

        seen_pairs = set(Application.objects.values_list("applicant_id", "job_id"))

        all_combos = [
            (applicant, job)
            for applicant in seekers
            for job in jobs
        ]
        new_combos = [
            combo
            for combo in all_combos
            if (combo[0].pk, combo[1].pk) not in seen_pairs
        ]

        effective_total = min(total, len(new_combos))
        if effective_total < total:
            self.stdout.write(
                self.style.WARNING(
                    f"Only {effective_total} unique seeker/job combinations available; "
                    f"capping --total {total} -> {effective_total}"
                )
            )

        applications = []
        for applicant, job in new_combos[:effective_total]:
            application = build_seed_application(applicant, job)
            application.save()
            applications.append(application)

        if responses_per_application > 0:
            responses = []
            for application in applications:
                excluded_ids = {application.applicant_id}
                for _ in range(responses_per_application):
                    responder_id = self._pick_responder(application, excluded_ids)
                    if responder_id is None:
                        break
                    excluded_ids.add(responder_id)
                    responses.append(
                        ApplicationResponse(
                            application=application,
                            responder_id=responder_id,
                            message=fake.text(),
                        )
                    )
            ApplicationResponse.objects.bulk_create(responses)

        self.stdout.write(
            self.style.SUCCESS(
                f"{effective_total} applications created "
                f"({responses_per_application} response(s) per application)"
            )
        )