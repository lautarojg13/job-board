from factory.django import DjangoModelFactory

from jobs.models import JobPost
from jobs.choices import JobPostStatus, EmploymentTypes

from users.factories import CustomUserFactory

import factory

class JobPostFactory(DjangoModelFactory):
    class Meta:
        model = JobPost
        skip_postgeneration_save = True
    
    title = factory.Sequence(lambda n: f'Job Title {n}')
    description = factory.Faker('paragraph')
    location = factory.Faker('city')
    status = JobPostStatus.ACTIVE
    employment_type = EmploymentTypes.FULL_TIME
    salary = factory.Faker('random_number', digits=5)
    posted_by = factory.SubFactory(CustomUserFactory)