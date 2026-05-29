from factory.django import DjangoModelFactory

from users.choices import UserRoleChoices
from users.models import CustomUser

import random
import factory

class CustomUserFactory(DjangoModelFactory):
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True
    
    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.Sequence(lambda n: f'user_{n}@test.com')
    password = 'TestPass123!'
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    role = factory.LazyFunction(
        lambda: random.choice(UserRoleChoices)
    )
    is_active = True
    
    @factory.post_generation
    def set_password(obj, create, extracted):
        if not create:
            return
        obj.set_password(obj.password)
        obj.save()