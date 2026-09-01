from companies.generators import CompanyNameGenerator
from companies.models import Company


def build_seed_company(existing_names):
    while True:
        name = CompanyNameGenerator.generate()
        if name not in existing_names:
            existing_names.add(name)
            return Company(name=name)


def build_seed_companies(total):
    existing_names = set(Company.objects.values_list("name", flat=True))
    return [build_seed_company(existing_names) for _ in range(total)]
