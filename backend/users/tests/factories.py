import pytest

from users.factories import CustomUserFactory


@pytest.fixture
def user_factory():
    return CustomUserFactory