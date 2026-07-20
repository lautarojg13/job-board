import pytest

from rest_framework.test import APIClient

from users.models import CustomUser

from unittest.mock import patch


REGISTRATION_TEST_CASES = [
    pytest.param(
        {
            "username": "random_user",
            "email": "lautaro25@outlook.com.ar",
            "first_name": "user fistname",
            "last_name": "user lastname",
            "password1": "valid_password",
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
            "password1": "password1",
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
            "password1": "valid_password",
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
            "password1": "valid_password",
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
            "password1": "valid_password",
            "password2": "valid_password",
        },
        400,
        id="likely_duplicate_username"
    ),
]

class TestRegisterUser:

    @pytest.mark.django_db
    @pytest.mark.parametrize("case_data,expected_status_code", REGISTRATION_TEST_CASES)
    @patch("users.adapter.send_email_task.delay")
    def test_register_user(self, mock_delay, case_data, expected_status_code, existing_test_user):
        client = APIClient()
        
        response = client.post("/auth/registration/", data=case_data)

        assert response.status_code == expected_status_code, \
            f"Expected status {expected_status_code}, got {response.status_code}. Response: {response.data}"

        if response.status_code == 201:
            
            # user = response.data["user"]
            
            # assert user["username"] == case_data["username"]
            # assert user["email"] == case_data["email"]
            # assert user["first_name"] == case_data["first_name"]
            # assert user["last_name"] == case_data["last_name"]
            
            # assert CustomUser.objects.filter(
            #     username=user["username"], 
            #     email=user["email"]
            # ).exists()
            
            assert 'Verification e-mail sent.' in response.data["detail"]
            mock_delay.assert_called_once()
        else:
            assert not CustomUser.objects.filter(
                username=case_data.get("username"),
                email=case_data.get("email")
            ).exists()

class TestDuplicatedEmail:

    @pytest.mark.django_db
    def test_duplicated_email(self):
        client = APIClient()
        data = {
            "username": "user1",
            "email": "repetido@mail.com",
            "password1": "password123",
            "password2": "password123"
        }
        
        client.post("/auth/registration/", data=data)
        
        data["username"] = "user2"
        response = client.post("/auth/registration/", data=data)
        
        assert response.status_code == 400
        assert "email" in response.data