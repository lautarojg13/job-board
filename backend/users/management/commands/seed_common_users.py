from users.management.commands.base_command import BaseSeedCommand
from users.choices import UserRoleChoices


class Command(BaseSeedCommand):
    help = "Create a number of common users for local development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=10,
            type=int,
            help="Number of common users that will be created",
        )

    def handle(self, *args, **options):
        self.seed_workflow(options["total"], UserRoleChoices.USER, "common users")