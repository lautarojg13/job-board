from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):

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
            help="Number of admin users to create (overrides ratio)",
        )
        parser.add_argument(
            "--common-users",
            default=None,
            type=int,
            help="Number of common users to create (overrides ratio)",
        )

    def handle(self, *args, **options):
        total = options["total"]
        admins_total = options["admins"]
        common_users_total = options["common_users"]

        if total <= 0:
            self.stdout.write("0 Users created successfully")
            return

        if admins_total is None and common_users_total is None:
            admins_total = min(total, max(1, total // 10))
            common_users_total = total - admins_total
        elif admins_total is None:
            common_users_total = max(0, common_users_total)
            admins_total = max(0, total - common_users_total)
        elif common_users_total is None:
            admins_total = max(0, admins_total)
            common_users_total = max(0, total - admins_total)
        else:
            admins_total = max(0, admins_total)
            common_users_total = max(0, common_users_total)

        created_total = 0

        if admins_total > 0:
            call_command("seed_admins", total=admins_total)
            created_total += admins_total

        if common_users_total > 0:
            call_command("seed_common_users", total=common_users_total)
            created_total += common_users_total

        self.stdout.write(f"{created_total} Users created successfully")