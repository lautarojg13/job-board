from users.choices import UserRoleChoices
from users.management.commands.base_command import BaseSeedCommand


class Command(BaseSeedCommand):
    help = "Seed a mix of admin and common users for local development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--total",
            default=10,
            type=int,
            help="Total number of users that will be created",
        )
        parser.add_argument(
            "--admins",
            default=None,
            type=int,
            help="Number of admin users to create (defaults to 10% of total, minimum 1)",
        )
        parser.add_argument(
            "--common-users",
            default=None,
            type=int,
            help="Number of common users to create",
        )

    def handle(self, *args, **options):
        total = max(0, options["total"])

        if total == 0:
            self.stdout.write("0 Users created successfully")
            return

        admins_total, common_users_total = self._resolve_counts(
            total, options["admins"], options["common_users"]
        )

        created_total = 0

        if admins_total > 0:
            self.seed_workflow(admins_total, UserRoleChoices.ADMIN, "admin users")
            created_total += admins_total

        if common_users_total > 0:
            self.seed_workflow(common_users_total, UserRoleChoices.USER, "common users")
            created_total += common_users_total

        self.stdout.write(f"{created_total} Users created successfully")

    def _resolve_counts(self, total, admins, common_users):
        if admins is None and common_users is None:
            admins = min(total, max(1, total // 10))
            common_users = total - admins
        elif admins is None:
            admins = max(0, total - common_users)
        elif common_users is None:
            common_users = max(0, total - admins)

        return max(0, admins), max(0, common_users)