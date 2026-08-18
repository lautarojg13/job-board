import pytest

from django.core.management import call_command

from allauth.account.models import EmailAddress

from companies.choices import CompanyRoleChoices
from companies.models import Company, CompanyMember
from jobs.choices import EmploymentTypes, JobPostStatus, WorkModeChoices
from jobs.models import JobPost
from users.choices import UserRoleChoices
from users.management.commands.make_test_user import (
    COMPANY_NAME,
    E2E_PASSWORD,
    EMPLOYER_EMAIL,
    SAMPLE_JOB_TITLE,
    SEEKER_EMAIL,
)
from users.management.commands.seed_utils import (
    SEED_USERNAME_PREFIX,
    build_seed_user,
    get_next_seed_username_index,
)
from users.models import CustomUser


@pytest.mark.django_db
class TestGetNextSeedUsernameIndex:
    def test_empty_database_returns_zero(self):
        assert get_next_seed_username_index() == 0

    def test_returns_max_index_plus_one(self):
        for index in (0, 2, 5):
            CustomUser.objects.create(
                username=f"{SEED_USERNAME_PREFIX}{index}",
                email=f"seed-{index}@test.com",
            )
        assert get_next_seed_username_index() == 6

    def test_ignores_non_numeric_suffixes(self):
        CustomUser.objects.create(
            username=f"{SEED_USERNAME_PREFIX}abc",
            email="seed-abc@test.com",
        )
        CustomUser.objects.create(
            username=f"{SEED_USERNAME_PREFIX}3",
            email="seed-3@test.com",
        )
        assert get_next_seed_username_index() == 4


@pytest.mark.django_db
class TestBuildSeedUser:
    def test_builds_unsaved_user_with_expected_fields(self):
        user = build_seed_user("user_7", UserRoleChoices.ADMIN)

        assert CustomUser.objects.count() == 0
        assert user.username == "user_7"
        assert user.email == "user_7@test.com"
        assert user.role == UserRoleChoices.ADMIN
        assert user.is_active


@pytest.mark.django_db
class TestSeedAdminsCommand:
    def test_creates_admins_with_verified_primary_emails(self):
        call_command("seed_admins", total=3)

        admins = CustomUser.objects.filter(role=UserRoleChoices.ADMIN)
        assert admins.count() == 3
        assert admins.filter(username__startswith=SEED_USERNAME_PREFIX).count() == 3

        for user in admins:
            email = EmailAddress.objects.get(user=user)
            assert email.verified
            assert email.primary
            assert email.email == user.email

    def test_zero_total_creates_nothing(self):
        call_command("seed_admins", total=0)
        assert CustomUser.objects.count() == 0

    def test_consecutive_runs_do_not_collide(self):
        call_command("seed_admins", total=2)
        call_command("seed_admins", total=2)
        assert CustomUser.objects.filter(role=UserRoleChoices.ADMIN).count() == 4


@pytest.mark.django_db
class TestSeedCommonUsersCommand:
    def test_creates_common_users(self):
        call_command("seed_common_users", total=5)
        assert CustomUser.objects.filter(role=UserRoleChoices.USER).count() == 5

    def test_zero_total_creates_nothing(self):
        call_command("seed_common_users", total=0)
        assert CustomUser.objects.count() == 0


@pytest.mark.django_db
class TestSeedUsersCommand:
    def test_default_ratio_ten_percent_admins_min_one(self):
        call_command("seed_users", total=10)
        assert CustomUser.objects.filter(role=UserRoleChoices.ADMIN).count() == 1
        assert CustomUser.objects.filter(role=UserRoleChoices.USER).count() == 9

    def test_default_total_is_ten(self):
        call_command("seed_users")
        assert CustomUser.objects.count() == 10

    def test_admins_override(self):
        call_command("seed_users", total=10, admins=5)
        assert CustomUser.objects.filter(role=UserRoleChoices.ADMIN).count() == 5
        assert CustomUser.objects.filter(role=UserRoleChoices.USER).count() == 5

    def test_common_users_override(self):
        call_command("seed_users", total=10, common_users=7)
        assert CustomUser.objects.filter(role=UserRoleChoices.ADMIN).count() == 3
        assert CustomUser.objects.filter(role=UserRoleChoices.USER).count() == 7

    def test_both_overrides_ignore_total(self):
        call_command("seed_users", total=100, admins=4, common_users=6)
        assert CustomUser.objects.filter(role=UserRoleChoices.ADMIN).count() == 4
        assert CustomUser.objects.filter(role=UserRoleChoices.USER).count() == 6

    def test_zero_total_creates_nothing(self):
        call_command("seed_users", total=0)
        assert CustomUser.objects.count() == 0


@pytest.mark.django_db
class TestMakeTestUserCommand:
    def test_creates_seed_data(self):
        call_command("make_test_user")

        seeker = CustomUser.objects.get(username=SEEKER_EMAIL)
        employer = CustomUser.objects.get(username=EMPLOYER_EMAIL)
        assert seeker.email == SEEKER_EMAIL
        assert seeker.is_active
        assert seeker.check_password(E2E_PASSWORD)
        assert employer.check_password(E2E_PASSWORD)

        for user in (seeker, employer):
            email = EmailAddress.objects.get(user=user)
            assert email.verified
            assert email.primary

        company = Company.objects.get(name=COMPANY_NAME)
        member = CompanyMember.objects.get(company=company, user=employer)
        assert member.company_role == CompanyRoleChoices.OWNER

        job = JobPost.objects.get(title=SAMPLE_JOB_TITLE)
        assert job.company == company
        assert job.status == JobPostStatus.ACTIVE
        assert job.work_mode == WorkModeChoices.REMOTE
        assert job.employment_type == EmploymentTypes.FULL_TIME
        assert job.posted_by == employer

    def test_is_idempotent(self):
        call_command("make_test_user")
        call_command("make_test_user")

        assert CustomUser.objects.count() == 2
        assert Company.objects.count() == 1
        assert CompanyMember.objects.count() == 1
        assert JobPost.objects.count() == 1