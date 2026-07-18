from users.factories import CustomUserFactory
from users.models import CustomUser


SEED_USERNAME_PREFIX = "user_"


def get_next_seed_username_index():
    max_index = -1

    for username in CustomUser.objects.filter(
        username__startswith=SEED_USERNAME_PREFIX
    ).values_list("username", flat=True):
        suffix = username[len(SEED_USERNAME_PREFIX):]

        if suffix.isdigit():
            max_index = max(max_index, int(suffix))

    return max_index + 1


def build_seed_user(username, role):
    return CustomUserFactory.build(
        username=username,
        email=f"{username}@test.com",
        role=role,
    )
