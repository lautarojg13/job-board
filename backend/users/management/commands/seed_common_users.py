from django.core.management.base import BaseCommand
from django.db import transaction

from users.choices import UserRoleChoices
from users.models import CustomUser

from .seed_utils import (
    SEED_USERNAME_PREFIX,
    build_seed_user,
    get_next_seed_username_index,
)


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=10,
            type=int,
            help="Number of common users that will be created",
        )

    def handle(self, *args, **options):
        total = options["total"]

        if total <= 0:
            self.stdout.write("0 common users created successfully")
            return

        next_index = get_next_seed_username_index()
        users = []

        for index in range(total):
            username = f"{SEED_USERNAME_PREFIX}{next_index + index}"
            users.append(build_seed_user(username, UserRoleChoices.USER))

        with transaction.atomic():
            CustomUser.objects.bulk_create(users)

        self.stdout.write(f"{total} common users created successfully")