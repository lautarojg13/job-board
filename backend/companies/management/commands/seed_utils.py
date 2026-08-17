from django.db.models import IntegerField, Max
from django.db.models.functions import Cast, Substr

from companies.models import Company


SEED_COMPANY_PREFIX = "seed_company_"


def get_next_seed_company_index():
    max_index = (
        Company.objects.filter(
            name__regex=rf"^{SEED_COMPANY_PREFIX}[0-9]+$"
        )
        .annotate(
            index=Cast(
                Substr("name", len(SEED_COMPANY_PREFIX) + 1),
                output_field=IntegerField(),
            )
        )
        .aggregate(max_index=Max("index"))["max_index"]
    )
    return max_index + 1 if max_index is not None else 0


def build_seed_company(index):
    return Company(name=f"{SEED_COMPANY_PREFIX}{index}")