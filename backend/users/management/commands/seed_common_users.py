from users.management.commands.base_command import BaseSeedCommand
from users.choices import UserRoleChoices


class Command(BaseSeedCommand):
    def add_arguments(self, parser):
        parser.add_argument("--total", default=10, type=int, help="Number of common users that will be created")
        
    def handle_create_common_users(self, total):
        self.create_users_with_role(total, UserRoleChoices.USER, "common users")
        
    def handle(self, *args, **options):
        total = options["total"]
        self.handle_create_common_users(total)