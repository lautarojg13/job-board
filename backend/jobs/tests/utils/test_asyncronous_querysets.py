import pytest

from jobs.choices import EmploymentTypes, JobPostStatus
from jobs.models import JobPost
from jobs.utils.asyncronous.querysets import build_jobs_queryset


@pytest.mark.django_db
class TestBuildJobsQueryset:

    def test_returns_all_visible_jobs_without_filters(self, user, company):
        first = JobPost.objects.create(
            posted_by=user, company=company, title="Python Dev"
        )
        second = JobPost.objects.create(
            posted_by=user, company=company, title="Backend Dev"
        )
        archived = JobPost.objects.create(
            posted_by=user,
            company=company,
            title="Archived Dev",
            status=JobPostStatus.ARCHIVED,
        )

        result = build_jobs_queryset({})

        assert set(result) == {first, second}
        assert archived not in result

    def test_filters_by_technologies_in_title_or_description(self, user, company):
        match_title = JobPost.objects.create(
            posted_by=user, company=company, title="Django Developer",
            description="Backend role",
        )
        match_description = JobPost.objects.create(
            posted_by=user, company=company, title="Backend Dev",
            description="Looking for Django and Postgres experience",
        )
        no_match = JobPost.objects.create(
            posted_by=user, company=company, title="Frontend Dev",
            description="React specialist",
        )

        result = build_jobs_queryset({"technologies": ["django"]})

        assert set(result) == {match_title, match_description}
        assert no_match not in result

    def test_filters_by_location(self, user, company):
        match = JobPost.objects.create(
            posted_by=user, company=company, title="Dev", location="Buenos Aires"
        )
        no_match = JobPost.objects.create(
            posted_by=user, company=company, title="Dev", location="Lima"
        )

        result = build_jobs_queryset({"location": "buenos"})

        assert set(result) == {match}
        assert no_match not in result

    def test_filters_by_employment_type(self, user, company):
        full_time = JobPost.objects.create(
            posted_by=user, company=company, title="Dev",
            employment_type=EmploymentTypes.FULL_TIME,
        )
        part_time = JobPost.objects.create(
            posted_by=user, company=company, title="Dev",
            employment_type=EmploymentTypes.PART_TIME,
        )

        result = build_jobs_queryset(
            {"employment_type": EmploymentTypes.FULL_TIME}
        )

        assert set(result) == {full_time}
        assert part_time not in result

    def test_filters_by_min_salary(self, user, company):
        lower = JobPost.objects.create(
            posted_by=user, company=company, title="Dev", salary=100000
        )
        higher = JobPost.objects.create(
            posted_by=user, company=company, title="Dev", salary=200000
        )

        result = build_jobs_queryset({"min_salary": 150000})

        assert set(result) == {higher}
        assert lower not in result

    def test_applies_multiple_filters_together(self, user, company):
        match = JobPost.objects.create(
            posted_by=user, company=company, title="Django Dev",
            description="Python backend", location="Buenos Aires",
            employment_type=EmploymentTypes.FULL_TIME, salary=200000,
        )
        wrong_location = JobPost.objects.create(
            posted_by=user, company=company, title="Django Dev",
            description="Python backend", location="Lima",
            employment_type=EmploymentTypes.FULL_TIME, salary=200000,
        )
        wrong_type = JobPost.objects.create(
            posted_by=user, company=company, title="Django Dev",
            description="Python backend", location="Buenos Aires",
            employment_type=EmploymentTypes.PART_TIME, salary=200000,
        )
        too_low = JobPost.objects.create(
            posted_by=user, company=company, title="Django Dev",
            description="Python backend", location="Buenos Aires",
            employment_type=EmploymentTypes.FULL_TIME, salary=100000,
        )

        result = build_jobs_queryset({
            "technologies": ["django", "python"],
            "location": "buenos",
            "employment_type": EmploymentTypes.FULL_TIME,
            "min_salary": 150000,
        })

        assert set(result) == {match}
        assert wrong_location not in result
        assert wrong_type not in result
        assert too_low not in result