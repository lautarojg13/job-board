import pytest

from jobs.serializers import JobPostCreateSerializer, JobPostListSerializer

from backend.conftest import CustomUserFactory
from jobs.factories import JobPostFactory


class TestJobPostCreateSerializer:
    
    @pytest.mark.parametrize(
        'missing_field',
        [
            'title',
        ]
    )
    @pytest.mark.django_db
    def test_serializer_missing_required_fields(self, missing_field, valid_job_post_data, authenticated_request):
        
        data = valid_job_post_data.copy()    
        
        data.pop(missing_field)
        
        request = authenticated_request()
        serializer = JobPostCreateSerializer(data=data, context={'request': request})
        assert not serializer.is_valid()
        
    @pytest.mark.parametrize(
        'missing_field',
        [
            'description',
            'location',
            "company",
            "salary",
            "employment_type",
            "status",
        ]
    )
    @pytest.mark.django_db
    def test_serializer_missing_not_required_fields(self, missing_field, valid_job_post_data, authenticated_request, user):
        
        data = valid_job_post_data.copy()
        
        data.pop(missing_field)
        
        request = authenticated_request()
        request.user = user
        
        serializer = JobPostCreateSerializer(data=data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        
    @pytest.mark.django_db
    def test_validate_company_method(self, valid_job_post_data, company, user, authenticated_request):
        
        data = valid_job_post_data.copy()
        
        data['company'] = company.id
        
        request = authenticated_request()
        
        job_post_serializer = JobPostCreateSerializer(data=data, context={'request': request})
        
        assert job_post_serializer.is_valid(), job_post_serializer.errors
    
    @pytest.mark.django_db
    def test_validate_company_method_not_owner_or_admin(self, valid_job_post_data, company, authenticated_request):
        
        data = valid_job_post_data.copy()
        
        data['company'] = company.id
        
        request = authenticated_request()
        request.user = CustomUserFactory()
        
        serializer = JobPostCreateSerializer(data=data, context={'request': request})
        
        assert not serializer.is_valid()
        assert 'company' in serializer.errors
    
class TestJobPostListSerializer:
    
    @pytest.mark.django_db
    def test_serializer_contains_expected_fields(self, job):

        serializer = JobPostListSerializer(job)

        expected_fields = {
            'id',
            'title',
            'company',
            'location',
            'description',
            'status',
            'work_mode',
            'employment_type',
            'salary',
        }

        assert set(serializer.data.keys()) == expected_fields, f"Expected fields: {expected_fields}, but got: {set(serializer.data.keys())}"
        
    @pytest.mark.django_db
    def test_serializer_with_many_true(self):

        jobs = JobPostFactory.create_batch(3)

        serializer = JobPostListSerializer(jobs, many=True)

        assert len(serializer.data) == 3