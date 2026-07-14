from factory.django import DjangoModelFactory

from django.contrib.auth.hashers import make_password

from users.choices import UserRoleChoices
from users.models import CustomUser

import factory

class CustomUserFactory(DjangoModelFactory):
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True
    
    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.LazyAttribute(
    lambda obj: f"{obj.username}@test.com"
)
    
    password = factory.LazyAttribute(
        lambda obj: make_password(f"{obj.username}_test_password")
    )
    
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = UserRoleChoices.USER
    is_active = True