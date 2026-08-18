import itertools

from jobs.choices import EmploymentTypes, JobPostStatus, WorkModeChoices
from jobs.factories import JobPostFactory


work_modes = itertools.cycle(WorkModeChoices.values)
employment_types = itertools.cycle(EmploymentTypes.values)
statuses = itertools.cycle(
    [
        JobPostStatus.ACTIVE,
        JobPostStatus.ACTIVE,
        JobPostStatus.ACTIVE,
        JobPostStatus.CLOSED,
        JobPostStatus.PAUSED,
    ]
)


def build_seed_job(company, posted_by):
    return JobPostFactory.build(
        company=company,
        posted_by=posted_by,
        work_mode=next(work_modes),
        employment_type=next(employment_types),
        status=next(statuses),
    )