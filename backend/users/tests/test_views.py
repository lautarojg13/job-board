import pytest
import json

from rest_framework.test import APIClient

from django.urls import reverse

from users.models import CustomUser


REGISTRATION_TEST_CASES = [
    pytest.param(
        {
            "username": "random_user",
            "email": "lautaro25@outlook.com.ar",
            "first_name": "user fistname",
            "last_name": "user lastname",
            "password": "valid_password",
            "password2": "valid_password",
        },
        201,
        id="valid_registration"
    ),
    pytest.param(
        {
            "username": "random_user",
            "email": "lautarojg25@outlook.com.ar",
            "first_name": "user fistname",
            "last_name": "user lastname",
            "password": "password1",
            "password2": "different_password",
        },
        400,
        id="passwords_dont_match"
    ),
    pytest.param(
        {
            "username": "random_user434",
            "email": "invalid email",
            "first_name": "user fistname",
            "last_name": "user lastname",
            "password": "valid_password",
            "password2": "valid_password",
        },
        400,
        id="invalid_email_format"
    ),
    pytest.param(
        {
            "username": "random_user435",
            "email": "random_email435@gmail.com",
            "first_name": "user fistname",
            "last_name": "user lastname",
            "password": "valid_password",
        },
        400,
        id="missing_password2_field"
    ),
    pytest.param(
        {
            "username": "random_user436",
            "email": "random_user@outlook.com",
            "first_name": "user fistname",
            "last_name": "user lastname",
            "password": "valid_password",
            "password2": "valid_password",
        },
        400,
        id="likely_duplicate_username"
    ),
]

@pytest.mark.django_db
@pytest.mark.parametrize("case_data,expected_status_code", REGISTRATION_TEST_CASES)
def test_register_user(case_data, expected_status_code, existing_test_user):
    client = APIClient()
    
    response = client.post(reverse("register_user"), data=case_data)

    assert response.status_code == expected_status_code, \
        f"Expected status {expected_status_code}, got {response.status_code}. Response: {response.data}"

    if response.status_code == 201:
        assert "message" in response.data
        assert "user" in response.data
        assert "tokens" in response.data

        user = response.data["user"]
        
        assert user["username"] == case_data["username"]
        assert user["email"] == case_data["email"]
        assert user["first_name"] == case_data["first_name"]
        assert user["last_name"] == case_data["last_name"]
        
        assert CustomUser.objects.filter(
            username=user["username"], 
            email=user["email"]
        ).exists()
    else:
        assert not CustomUser.objects.filter(
            username=case_data.get("username"),
            email=case_data.get("email")
        ).exists()
        
@pytest.mark.django_db
def test_duplicated_email():
    client = APIClient()
    data = {
        "username": "user1",
        "email": "repetido@mail.com",
        "password": "password123",
        "password2": "password123"
    }
    
    client.post(reverse("register_user"), data=data)
    
    data["username"] = "user2"
    response = client.post(reverse("register_user"), data=data)
    
    assert response.status_code == 400
    assert "email" in response.data