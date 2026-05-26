from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from .models import JobPost

class JobPostSerializer(ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['id', 'title', 'description', 'company', 'location', 'posted_by', 'posted_at', 'status', 'employment_type', 'salary']
        read_only_fields = ('posted_by','company')
        
class JobPostListSerializer(ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['id', 'title', 'description', 'company', 'location', 'status', 'employment_type', 'salary']
        
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
            'salary'
        ]

    def validate_company(self, value):

        user = self.context['request'].user

        is_owner = value.owner == user
        is_admin = value.admins.filter(id=user.id).exists()

        if not (is_owner or is_admin):
            raise ValidationError(
                "You cannot post new jobs in this company."
            )

        return value