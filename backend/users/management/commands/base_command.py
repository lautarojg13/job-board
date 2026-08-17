from django.core.management.base import BaseCommand
from django.db import transaction

from allauth.account.models import EmailAddress

from users.management.commands.seed_utils import build_seed_user, get_next_seed_username_index, SEED_USERNAME_PREFIX
from users.models import CustomUser

class BaseSeedCommand(BaseCommand):
    
    def _create_users(self, total, role):
        next_index = get_next_seed_username_index()
        return [
            build_seed_user(f"{SEED_USERNAME_PREFIX}{next_index + i}", role) 
            for i in range(total)
        ]

    def _persist_users(self, users):
        with transaction.atomic():
            created_users = CustomUser.objects.bulk_create(users)
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
            self.stdout.write(f"0 {success_message} created")
            return

        users = self._create_users(total, role)
        created_users = self._persist_users(users)
        
        if post_save_hook:
            post_save_hook(created_users)
            
        self.stdout.write(f"{total} {success_message} created successfully")