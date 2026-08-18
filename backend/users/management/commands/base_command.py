from django.core.management.base import BaseCommand
from django.db import transaction

from allauth.account.models import EmailAddress

from users.management.commands.seed_utils import (
    SEED_USERNAME_PREFIX,
    build_seed_user,
    get_next_seed_username_index,
)
from users.models import CustomUser


class BaseSeedCommand(BaseCommand):
    def execute(self, *args, **options):
        self.verbosity = options.get("verbosity", 1)
        return super().execute(*args, **options)

    def _create_users(self, total, role):
        next_index = get_next_seed_username_index()
        return [
            build_seed_user(f"{SEED_USERNAME_PREFIX}{next_index + i}", role)
            for i in range(total)
        ]

    def _persist_users(self, users):
        with transaction.atomic():
            created_users = CustomUser.objects.bulk_create(users)
            user_ids = dict(
                CustomUser.objects.filter(
                    username__in=[user.username for user in created_users]
                ).values_list("username", "id")
            )
            for user in created_users:
                user.pk = user_ids[user.username]

            EmailAddress.objects.bulk_create(
                [
                    EmailAddress(
                        user=user,
                        email=user.email,
                        verified=True,
                        primary=True,
                    )
                    for user in created_users
                ]
            )
            return created_users

    def seed_workflow(self, total, role, success_message, post_save_hook=None):
        if total <= 0:
            self._write(f"0 {success_message} created")
            return

        users = self._create_users(total, role)
        created_users = self._persist_users(users)

        if post_save_hook:
            post_save_hook(created_users)

        self._write(f"{total} {success_message} created successfully")

    def _write(self, message):
        if self.verbosity > 0:
            self.stdout.write(message)