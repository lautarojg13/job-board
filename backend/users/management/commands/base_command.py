from django.core.management.base import BaseCommand
from django.db import transaction

from users.management.commands.seed_utils import build_seed_user, get_next_seed_username_index, SEED_USERNAME_PREFIX

from users.models import CustomUser

class BaseSeedCommand(BaseCommand):
    
    def create_users_with_role(self, total, role, success_message):
        if total <= 0:
            self.stdout.write(f"0 {success_message} created successfully")
            return
            
        next_index = get_next_seed_username_index()
        users = [build_seed_user(f"{SEED_USERNAME_PREFIX}{next_index + i}", role) for i in range(total)]
        
        with transaction.atomic():
            CustomUser.objects.bulk_create(users)
            
        self.stdout.write(f"{total} {success_message} created successfully")