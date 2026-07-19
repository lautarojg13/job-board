import pytest
from rest_framework.test import APIRequestFactory

from users.serializers import (
    CustomUserRegistrationSerializer,
    CustomUserDetailsSerializer,
)
from users.models import CustomUser

from users.choices import UserRoleChoices



class TestCustomUserRegistrationSerializer:
    
    @pytest.mark.django_db
    def test_register_valid_data_creates_user(self):
        """Test that valid data creates a user with hashed password"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!',
            'first_name': 'John',
            'last_name': 'Doe',
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
                
        factory = APIRequestFactory()
        request = factory.post("/register/")
        
        assert serializer.is_valid(), serializer.errors
        
        user = serializer.save(request=request)
        
        assert CustomUser.objects.filter(username='newuser').exists()
        assert user.check_password('TestPass123!')
        assert user.email == 'newuser@test.com'
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'
        assert user.role == UserRoleChoices.USER

    @pytest.mark.django_db
    def test_register_passwords_mismatch_raises_error(self):
        """Test that mismatched passwords raise ValidationError"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass456!',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors

    @pytest.mark.django_db
    def test_register_password1_too_short_raises_error(self):
        """Test that password shorter than 8 characters raises ValidationError"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password1': 'Test123',
            'password2': 'Test123'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        
        errors = serializer.errors["password1"]
        assert any(error.code == "password_too_short" for error in errors)

    @pytest.mark.django_db
    def test_register_duplicate_email_raises_error(self):
        """Test that duplicate email raises ValidationError"""
        CustomUser.objects.create_user(username='existing', email='test@test.com', password='TestPass123!')
        
        data = {
            'username': 'newuser',
            'email': 'test@test.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        print(serializer.errors)
        assert 'email' in serializer.errors

    @pytest.mark.django_db
    def test_register_email_case_insensitive_uniqueness(self):
        """Test that email uniqueness is case-insensitive"""
        CustomUser.objects.create_user(username='existing', email='test@test.com', password='TestPass123!')
        
        data = {
            'username': 'newuser',
            'email': 'TEST@TEST.COM',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()

    @pytest.mark.django_db
    def test_register_missing_username_raises_error(self):
        """Test that missing username raises ValidationError"""
        data = {
            'email': 'newuser@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        serializer.is_valid()
        assert 'username' in serializer.errors

    @pytest.mark.django_db
    def test_register_missing_email_raises_error(self):
        """Test that missing email raises ValidationError"""
        data = {
            'username': 'newuser',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        serializer.is_valid()
        
        assert 'email' in serializer.errors

    @pytest.mark.django_db
    def test_register_role_defaults_to_dev(self):
        """Test that role defaults to 'dev' when not specified"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        assert user.role == UserRoleChoices.CANDIDATE

    @pytest.mark.django_db
    def test_register_password_hashed_not_plaintext(self):
        """Test that password is hashed and not stored as plaintext"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        retrieved_user = CustomUser.objects.get(username='newuser')
        assert retrieved_user.password != 'TestPass123!'
        assert retrieved_user.check_password('TestPass123!')


class TestUserProfileInfoSerializer:
    """Tests for UserProfileInfoSerializer"""

    @pytest.mark.django_db
    def test_profile_serializes_all_required_fields(self, user_factory):
        """Test that serializer includes all required fields"""
        user = user_factory.create()
        
        serializer = CustomUserDetailsSerializer(user)
        data = serializer.data
        
        assert 'id' in data
        assert 'username' in data
        assert 'email' in data
        assert 'first_name' in data
        assert 'last_name' in data
        assert 'role' in data

    @pytest.mark.django_db
    def test_profile_serializes_with_empty_optional_fields(self):
        """Test that serializer handles empty optional fields correctly"""
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='TestPass123!',
            first_name='',
            last_name=''
        )
        
        serializer = CustomUserDetailsSerializer(user)
        data = serializer.data
        
        assert data['first_name'] == ''
        assert data['last_name'] == ''

    def test_profile_email_is_readonly(self):
        """Test that email field is in read_only_fields"""
        serializer = CustomUserDetailsSerializer()
        assert 'email' in serializer.fields
        assert serializer.fields['email'].read_only

    def test_profile_readonly_fields_not_writable(self):
        """Test that read-only fields cannot be modified"""
        serializer = CustomUserDetailsSerializer()
        
        # Email should be read-only
        assert serializer.fields['email'].read_only

    def test_profile_serializer_fields_configuration(self):
        """Test that serializer has correct field configuration"""
        serializer = CustomUserDetailsSerializer()
        
        expected_fields = {'id', 'username', 'email', 'first_name', 'last_name', 'role'}
        actual_fields = set(serializer.fields.keys())
        
        assert actual_fields == expected_fields
        assert 'email' in serializer.Meta.read_only_fields
