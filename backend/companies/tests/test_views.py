import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from users.factories import CustomUserFactory

# Adjust the import path according to your app structure
from companies.models import Company


@pytest.fixture
def api_client():
    """Fixture to provide an unauthenticated REST framework API client."""
    return APIClient()


@pytest.fixture
def company_factory(db):
    """Fixture factory to easily create company instances in tests."""
    def _create_company(name="Tech Corp", description="A tech firm", website="https://tech.com"):
        return Company.objects.create(
            name=name,
            description=description,
            website=website
        )
    return _create_company


@pytest.mark.django_db
class TestCompanyListCreateView:
    # Replace 'company-list-create' with your actual path name in urls.py
    url = reverse("company-list-create")

    def test_list_companies_and_followers_count(self, api_client, company_factory, django_user_model):
        """
        Ensures GET request returns company list with correctly annotated 'followers_count'.
        """
        # Given: A company with two followers assigned
        company = company_factory(name="Acme Inc", website="https://acme.com")
        user_a = CustomUserFactory(username="usera", password="password123")
        user_b = CustomUserFactory(username="userb", password="password123")
        company.followers.add(user_a, user_b)

        # When: Sending a GET request to the list endpoint
        response = api_client.get(self.url)

        # Then: Verify status, payload structure, and correct followers aggregation
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        
        company_data = response.data[0]
        assert company_data["id"] == company.id
        assert company_data["name"] == company.name
        # Critical test: verifying custom annotate logic in get_queryset()
        assert company_data["followers_count"] == 2

    def test_create_company_success(self, api_client):
        """
        Ensures POST request successfully creates a new company in DB and returns 201.
        """
        # Given: Valid payload for company creation
        payload = {
            "name": "Global Solutions",
            "description": "Leading global company",
            "website": "https://globalsolutions.com"
        }

        # When: Sending a POST request
        response = api_client.post(self.url, payload, format="json")

        # Then: Verify resource creation and response data
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == payload["name"]
        assert response.data["followers_count"] == 0  # Read-only field should default to 0 on creation
        
        # Verify persistence in database
        assert Company.objects.filter(name="Global Solutions").exists()