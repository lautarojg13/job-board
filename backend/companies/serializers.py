from rest_framework import serializers
from .models import Company, CompanyMember


class CompanyMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    company_role_display = serializers.CharField(source='get_company_role_display', read_only=True)

    class Meta:
        model = CompanyMember
        fields = ['id', 'user', 'user_email', 'company_role', 'company_role_display']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "description", "website"]

class PublicCompanySerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ["id", "name", "description", "website", "followers_count"]

    def get_followers_count(self, obj):
        return getattr(obj, "followers_count", obj.followers.count())

class OwnerCompanySerializer(serializers.ModelSerializer):
    members = CompanyMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ["id", "name", "description", "website", "created_at", "members"]