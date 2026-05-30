from django.db.models import Q

from jobs.models import JobPost

def build_jobs_queryset(valid_data):
    queryset = JobPost.objects.all()

    query = Q()

    for keyword in valid_data.get('technologies', []):
        query |= (
            Q(title__icontains=keyword) |
            Q(description__icontains=keyword)
        )

    if query:
        queryset = queryset.filter(query)

    if valid_data.get('location'):
        queryset = queryset.filter_by_location(valid_data['location'])
        
    if valid_data.get('employment_type') is not None:
        queryset = queryset.filter_by_employment_type(valid_data['employment_type'])

    if valid_data.get('min_salary'):
        queryset = queryset.filter_by_min_salary(int(valid_data['min_salary']))

    return queryset