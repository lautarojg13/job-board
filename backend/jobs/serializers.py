from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from jobs.models import JobPost
from companies.models import CompanyMember
from companies.choices import CompanyRoleChoices


class JobPostSerializer(ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['id', 'title', 'description', 'company', 'location', 'posted_by', 'posted_at', 'status', 'employment_type', 'salary', 'work_mode']
        read_only_fields = ('posted_by','company')
        
class JobPostListSerializer(ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['id', 'title', 'description', 'company', 'location', 'posted_by', 'posted_at', 'status', 'employment_type', 'salary', 'work_mode']
        
class JobPostCreateSerializer(ModelSerializer):

    class Meta:
        model = JobPost

        fields = [
            'title',
            'description',
            'company',
            'location',
            'status',
            'employment_type',
            'salary',
            'work_mode'
        ]

    def validate_company(self, value):
        user = self.context['request'].user

        is_member = CompanyMember.objects.filter(
            company=value,
            user=user,
            company_role__in=[CompanyRoleChoices.OWNER, CompanyRoleChoices.RECRUITER]
        ).exists()

        if not is_member:
            raise ValidationError(
                "You cannot post new jobs in this company."
            )

        return value