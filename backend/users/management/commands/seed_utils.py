from django.db.models import IntegerField, Max
from django.db.models.functions import Cast, Substr

from users.factories import CustomUserFactory
from users.models import CustomUser


SEED_USERNAME_PREFIX = "user_"


def get_next_seed_username_index():
    max_index = (
        CustomUser.objects.filter(
            username__regex=rf"^{SEED_USERNAME_PREFIX}[0-9]+$"
        )
        .annotate(
            index=Cast(
                Substr("username", len(SEED_USERNAME_PREFIX) + 1),
                output_field=IntegerField(),
            )
        )
        .aggregate(max_index=Max("index"))["max_index"]
    )
    return max_index + 1 if max_index is not None else 0


def build_seed_user(username, role):
    return CustomUserFactory.build(
        username=username,
        email=f"{username}@test.com",
        role=role,
    )
