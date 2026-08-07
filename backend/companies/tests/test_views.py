import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from users.factories import CustomUserFactory

# Adjust the import path according to your app structure
from companies.models import Company, CompanyMember
from companies.choices import CompanyRoleChoices


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
        
        
@pytest.fixture
def company(db):
    """Fixture to create a base company instance."""
    return Company.objects.create(
        name="Acme Corporation",
        description="Original description",
        website="https://acme.com"
    )


@pytest.mark.django_db
class TestCompanyRetrieveUpdateView:
    
    def get_url(self, company_id):
        """Helper method to construct URL using company_id kwarg."""
        return reverse("company-detail", kwargs={"company_id": company_id})

    def test_retrieve_company_public_access_success(self, api_client, company):
        """
        Ensures any user (unauthenticated) can retrieve company details (GET request).
        """
        url = self.get_url(company.id)

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == company.id
        assert response.data["name"] == company.name
        assert response.data["description"] == company.description

    def test_update_company_by_owner_success(self, api_client, company, django_user_model):
        """
        Ensures a user with OWNER role in CompanyMember can update company details.
        """
        # Given: An authenticated user assigned as OWNER of the company
        owner_user = django_user_model.objects.create_user(username="owner", password="password123")
        CompanyMember.objects.create(
            company=company,
            user=owner_user,
            company_role=CompanyRoleChoices.OWNER
        )
        api_client.force_authenticate(user=owner_user)

        url = self.get_url(company.id)
        payload = {"name": "Acme Updated", "description": "New description", "website": "https://acme.com"}

        # When: Sending a PATCH/PUT request to update company details
        response = api_client.patch(url, payload, format="json")

        # Then: Update must succeed with HTTP 200 OK
        assert response.status_code == status.HTTP_200_OK
        company.refresh_from_db()
        assert company.name == "Acme Updated"
        assert company.description == "New description"

    def test_update_company_forbidden_for_non_owner(self, api_client, company, django_user_model):
        """
        Ensures an authenticated user without OWNER status gets HTTP 403 FORBIDDEN.
        """
        # Given: An authenticated regular user with no ownership
        regular_user = django_user_model.objects.create_user(username="regular", password="password123")
        api_client.force_authenticate(user=regular_user)

        url = self.get_url(company.id)
        payload = {"name": "Unauthorized Attempt"}

        # When: Sending an update request
        response = api_client.patch(url, payload, format="json")

        # Then: System must block request and return HTTP 403 FORBIDDEN
        assert response.status_code == status.HTTP_403_FORBIDDEN
        company.refresh_from_db()
        assert company.name != "Unauthorized Attempt"