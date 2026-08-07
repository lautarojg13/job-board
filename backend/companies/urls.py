from django.urls import path
from .views import *

urlpatterns = [
    path("companies/", CompanyListCreateView.as_view(), name="company-list-create"),
    path("companies/<int:company_id>/", CompanyRetrieveUpdateView.as_view(), name="company-detail"),
    path("companies/<int:company_id>/jobs/", CompanyJobListView.as_view(), name="company-job-list"),
]