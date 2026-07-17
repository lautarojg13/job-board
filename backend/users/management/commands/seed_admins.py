from users.management.commands.base_command import BaseSeedCommand
from users.choices import UserRoleChoices


class Command(BaseSeedCommand):

	def add_arguments(self, parser):
		parser.add_argument(
			"--total",
			default=1,
			type=int,
			help="Number of admin users that will be created"
		)

	def handle_create_admins(self, total):
		self.create_users_with_role(total, UserRoleChoices.ADMIN, "admin users")

	def handle(self, *args, **options):
		total = options["total"]
		self.handle_create_admins(total)