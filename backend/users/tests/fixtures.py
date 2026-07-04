import pytest

from users.models import CustomUser

@pytest.fixture
def user():
    return CustomUser.objects.create_user(username="random_user",email="random_user@gmail.com",password="123456", role="dev")


@pytest.fixture
def user_2():
    return CustomUser.objects.create_user(username="random_user_2",email="random_user_2@gmail.com",password="123456", role="dev")


@pytest.fixture(scope="function")
def existing_test_user(django_db_blocker):
    with django_db_blocker.unblock():
        return CustomUser.objects.create_user(
            username="existing_user",
            email="random_user@outlook.com",
            password="somepassword"
        )


@pytest.fixture
def login_serializer_valid_data():
    return {
        'username': 'testuser',
        'password': 'TestPass123!'
    }


@pytest.fixture
def login_serializer_invalid_data():
    return {
        'username': 'nonexistent',
        'password': 'WrongPassword'
    }