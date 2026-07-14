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
			default=1,
			type=int,
			help="Number of admin users that will be created",
		)

	def handle(self, *args, **options):
		total = options["total"]

		if total <= 0:
			self.stdout.write("0 admin users created successfully")
			return

		next_index = get_next_seed_username_index()
		admins = []

		for index in range(total):
			username = f"{SEED_USERNAME_PREFIX}{next_index + index}"
			admins.append(build_seed_user(username, UserRoleChoices.ADMIN))

		with transaction.atomic():
			CustomUser.objects.bulk_create(admins)

		self.stdout.write(f"{total} admin users created successfully")
