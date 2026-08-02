from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from django.db.models import Count
from django.shortcuts import get_object_or_404

from companies.serializers import PublicCompanySerializer, OwnerCompanySerializer
from companies.models import Company, CompanyMember
from companies.permissions import IsCompanyOwner
from companies.choices import CompanyRoleChoices

from jobs.serializers import JobPostListSerializer
from jobs.models import JobPost

# Create your views here.

class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = PublicCompanySerializer
    
    def get_queryset(self):
        return Company.objects.annotate(
            followers_count=Count("followers")
        )
        
class CompanyRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PublicCompanySerializer
    queryset = Company.objects.all()
    permission_classes = [IsCompanyOwner]
    
    lookup_field = "id"
    lookup_url_kwarg = "company_id"
    
    def perform_update(self, serializer):
        
        if not IsCompanyOwner:
            raise PermissionDenied()
        
        return serializer.save()
    
class CompanyJobListView(generics.ListAPIView):
    serializer_class = JobPostListSerializer
    
    def get_queryset(self):
        
        if getattr(self, "swagger_fake_view", False):
            return JobPost.objects.none()
        
        company_id = self.kwargs.get("company_id")
        
        get_object_or_404(Company, id=company_id)
        
        return JobPost.objects.filter(
            company_id=company_id, 
            status=JobPost.ACTIVE
        )
        
class UserCompanyListView(generics.ListAPIView):
    serializer_class = OwnerCompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company_ids = CompanyMember.objects.filter(
            user=self.request.user,
            company_role=CompanyRoleChoices.OWNER
        ).values_list('company_id', flat=True)
        
        return Company.objects.filter(id__in=company_ids)