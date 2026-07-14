from django.core.management.base import BaseCommand
from django.db import transaction

from users.choices import UserRoleChoices
from users.factories import CustomUserFactory

from users.models import CustomUser


SEED_USERNAME_PREFIX = "user_"


def get_next_seed_username_index():
    max_index = -1

    for username in CustomUser.objects.filter(username__startswith=SEED_USERNAME_PREFIX).values_list("username", flat=True):
        suffix = username[len(SEED_USERNAME_PREFIX):]

        if suffix.isdigit():
            max_index = max(max_index, int(suffix))

    return max_index + 1


def build_seed_user(username, role):
    return CustomUserFactory.build(
        username=username,
        email=f"{username}@test.com",
        role=role,
    )


class Command(BaseCommand):
    
    def add_arguments(self, parser):
        parser.add_argument("--total", default=10, type=int, help="Number of users will be created")
    
    def handle(self, *args, **options):
        total = options["total"]

        if total <= 0:
            self.stdout.write("0 Users created successfully")
            return

        next_index = get_next_seed_username_index()
        admin_total = min(total, max(1, total // 10))

        users = []
        for index in range(total):
            username = f"{SEED_USERNAME_PREFIX}{next_index + index}"
            role = UserRoleChoices.ADMIN if index < admin_total else UserRoleChoices.USER
            users.append(build_seed_user(username, role))

        with transaction.atomic():
            CustomUser.objects.bulk_create(users)

        self.stdout.write(f"{total} Users created successfully")