from users.management.commands.base_command import BaseSeedCommand
from users.choices import UserRoleChoices


class Command(BaseSeedCommand):
    help = "Create a number of admin users for local development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=1,
            type=int,
            help="Number of admin users that will be created",
        )

    def handle(self, *args, **options):
        self.seed_workflow(options["total"], UserRoleChoices.ADMIN, "admin users")