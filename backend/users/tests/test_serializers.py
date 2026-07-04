import pytest
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import TokenError

from users.serializers import (
    LoginUserSerializer,
    CustomUserRegistrationSerializer,
    UserProfileInfoSerializer,
    LogoutSerializer
)
from users.models import CustomUser

from users.choices import UserRoleChoices


class TestLoginUserSerializer:
    """Tests for LoginUserSerializer"""

    @patch('users.serializers.authenticate')
    @patch('users.serializers.RefreshToken.for_user')
    @pytest.mark.django_db
    def test_login_valid_credentials_returns_tokens(self, mock_refresh, mock_auth, user_factory):
        """Test that valid credentials return access and refresh tokens with expiration times"""
        user = user_factory()
        mock_auth.return_value = user
        
        mock_token = MagicMock()
        mock_token.access_token = MagicMock()
        mock_token.access_token.lifetime.total_seconds.return_value = 300
        mock_token.lifetime.total_seconds.return_value = 86400
        mock_token.access_token.__str__.return_value = "access_token_value"
        mock_token.__str__.return_value = "refresh_token_value"
        mock_refresh.return_value = mock_token
        
        serializer = LoginUserSerializer(data={'username': 'testuser', 'password': 'TestPass123!'})
        assert serializer.is_valid()
        
        validated_data = serializer.validated_data
        
        assert 'access' in validated_data
        assert 'refresh' in validated_data
        assert 'access_expires' in validated_data
        assert 'refresh_expires' in validated_data

    @patch('users.serializers.authenticate')
    @patch('users.serializers.RefreshToken.for_user')
    @pytest.mark.django_db
    def test_login_valid_credentials_returns_correct_user(self, mock_refresh, mock_auth, user_factory):
        """Test that the returned user matches the authenticated user"""
        
        test_username = 'testuser'
        test_password = 'TestPass123!'
        user = user_factory(username=test_username, password=test_password)
        mock_auth.return_value = user
        
        mock_token = MagicMock()
        mock_token.access_token = MagicMock()
        mock_token.access_token.lifetime.total_seconds.return_value = 300
        mock_token.lifetime.total_seconds.return_value = 86400
        mock_token.access_token.__str__.return_value = "access_token_value"
        mock_token.__str__.return_value = "refresh_token_value"
        mock_refresh.return_value = mock_token
        
        serializer = LoginUserSerializer(data={'username': test_username, 'password': test_password})
        assert serializer.is_valid()
        
        assert serializer.validated_data['user']["id"] == user.id


    @patch('users.serializers.authenticate')
    @pytest.mark.django_db
    def test_login_invalid_credentials_raises_error(self, mock_auth):
        """Test that invalid credentials raise ValidationError with correct message"""
        mock_auth.return_value = None
        
        serializer = LoginUserSerializer(data={'username': 'testuser', 'password': 'WrongPassword'})
        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors

    @patch('users.serializers.authenticate')
    @pytest.mark.django_db
    def test_login_wrong_password_raises_error(self, mock_auth):
        """Test that wrong password raises ValidationError"""
        mock_auth.return_value = None
        
        serializer = LoginUserSerializer(data={'username': 'testuser', 'password': 'WrongPassword'})
        assert not serializer.is_valid()

    @patch('users.serializers.authenticate')
    @patch('users.serializers.RefreshToken.for_user')
    @pytest.mark.django_db
    def test_login_inactive_user_raises_error(self, mock_refresh, mock_auth, user_factory):
        """Test that inactive user raises ValidationError"""
        user = user_factory.build(is_active=False)
        mock_auth.return_value = user
        
        serializer = LoginUserSerializer(data={'username': 'testuser', 'password': 'TestPass123!'})
        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors

    @pytest.mark.django_db
    def test_login_missing_username_raises_error(self):
        """Test that missing username raises ValidationError"""
        serializer = LoginUserSerializer(data={'password': 'TestPass123!'})
        assert not serializer.is_valid()
        assert "username" in serializer.errors

    @pytest.mark.django_db
    def test_login_missing_password_raises_error(self):
        """Test that missing password raises ValidationError"""
        serializer = LoginUserSerializer(data={'username': 'testuser'})
        assert not serializer.is_valid()
        assert "password" in serializer.errors

    @pytest.mark.django_db
    def test_login_both_fields_empty_raises_error(self):
        """Test that both fields being empty raises ValidationError"""
        serializer = LoginUserSerializer(data={'username': '', 'password': ''})
        assert not serializer.is_valid()
        assert "username" in serializer.errors and "password" in serializer.errors

    @patch('users.serializers.authenticate')
    @patch('users.serializers.RefreshToken.for_user')
    @pytest.mark.django_db
    def test_login_returns_correct_token_structure(self, mock_refresh, mock_auth, user_factory):
        """Test that response contains correct token structure with proper types"""
        
        test_username = 'testuser'
        test_password = 'TestPass123!'
        user = user_factory(username=test_username, password=test_password)
        mock_auth.return_value = user
        
        mock_token = MagicMock()
        mock_token.access_token = MagicMock()
        mock_token.access_token.lifetime.total_seconds.return_value = 300
        mock_token.lifetime.total_seconds.return_value = 86400
        mock_token.access_token.__str__.return_value = "access_token_value"
        mock_token.__str__.return_value = "refresh_token_value"
        mock_refresh.return_value = mock_token
        
        serializer = LoginUserSerializer(data={'username': test_username, 'password': test_password})
        assert serializer.is_valid()
        
        validated_data = serializer.validated_data
        assert isinstance(validated_data['access'], str)
        assert isinstance(validated_data['refresh'], str)
        assert isinstance(validated_data['access_expires'], int)
        assert isinstance(validated_data['refresh_expires'], int)

    def test_login_empty_strings_treated_as_missing(self):
        """Test that empty strings are treated as missing fields"""
        serializer = LoginUserSerializer(data={'username': '', 'password': 'TestPass123!'})
        assert not serializer.is_valid()
        assert "username" in serializer.errors

    @patch('users.serializers.authenticate')
    @patch('users.serializers.RefreshToken.for_user')
    @pytest.mark.django_db
    def test_login_response_contains_user_object(self, mock_refresh, mock_auth, user_factory):
        """Test that response contains the user object"""
        
        test_username = 'testuser'
        test_password = 'TestPass123!'
        user = user_factory(username=test_username, password=test_password)
        mock_auth.return_value = user
        
        mock_token = MagicMock()
        mock_token.access_token = MagicMock()
        mock_token.access_token.lifetime.total_seconds.return_value = 300
        mock_token.lifetime.total_seconds.return_value = 86400
        mock_token.access_token.__str__.return_value = "access_token_value"
        mock_token.__str__.return_value = "refresh_token_value"
        mock_refresh.return_value = mock_token
        
        
        serializer = LoginUserSerializer(data={'username': test_username, 'password': test_password})
        assert serializer.is_valid()
        
        assert 'user' in serializer.validated_data
        assert serializer.validated_data['user']['id'] == user.id
        
        mock_auth.assert_called_once_with(username=test_username, password=test_password)


class TestCustomUserRegistrationSerializer:
    """Tests for CustomUserRegistrationSerializer"""

    @pytest.mark.django_db
    def test_register_valid_data_creates_user(self):
        """Test that valid data creates a user with hashed password"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': UserRoleChoices.CANDIDATE
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        assert CustomUser.objects.filter(username='newuser').exists()
        assert user.check_password('TestPass123!')
        assert user.email == 'newuser@test.com'
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'
        assert user.role == UserRoleChoices.CANDIDATE

    @pytest.mark.django_db
    def test_register_passwords_mismatch_raises_error(self):
        """Test that mismatched passwords raise ValidationError"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass456!',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
        assert "Provided password don't match" in str(serializer.errors)

    @pytest.mark.django_db
    def test_register_password_too_short_raises_error(self):
        """Test that password shorter than 8 characters raises ValidationError"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'Test123',
            'password2': 'Test123'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()

    @pytest.mark.django_db
    def test_register_password2_too_short_raises_error(self):
        """Test that password2 shorter than 8 characters raises ValidationError"""
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'TestPass123!',
            'password2': 'Test123'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()

    @pytest.mark.django_db
    def test_register_duplicate_email_raises_error(self):
        """Test that duplicate email raises ValidationError"""
        CustomUser.objects.create_user(username='existing', email='test@test.com', password='TestPass123!')
        
        data = {
            'username': 'newuser',
            'email': 'test@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!'
        }
        
        serializer = CustomUserRegistrationSerializer(data=data)
        assert not serializer.is_valid()
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
        
        serializer = UserProfileInfoSerializer(user)
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
        
        serializer = UserProfileInfoSerializer(user)
        data = serializer.data
        
        assert data['first_name'] == ''
        assert data['last_name'] == ''

    def test_profile_email_is_readonly(self):
        """Test that email field is in read_only_fields"""
        serializer = UserProfileInfoSerializer()
        assert 'email' in serializer.fields
        assert serializer.fields['email'].read_only

    def test_profile_readonly_fields_not_writable(self):
        """Test that read-only fields cannot be modified"""
        serializer = UserProfileInfoSerializer()
        
        # Email should be read-only
        assert serializer.fields['email'].read_only

    def test_profile_serializer_fields_configuration(self):
        """Test that serializer has correct field configuration"""
        serializer = UserProfileInfoSerializer()
        
        expected_fields = {'id', 'username', 'email', 'first_name', 'last_name', 'role'}
        actual_fields = set(serializer.fields.keys())
        
        assert actual_fields == expected_fields
        assert 'email' in serializer.Meta.read_only_fields


class TestLogoutSerializer:
    """Tests for LogoutSerializer"""

    @patch('users.serializers.RefreshToken')
    def test_logout_valid_token_blacklists_successfully(self, mock_refresh_token_class):
        """Test that valid token is successfully blacklisted"""
        mock_instance = MagicMock()
        mock_refresh_token_class.return_value = mock_instance
        
        serializer = LogoutSerializer(data={'refresh': 'valid_token'})
        assert serializer.is_valid()
        
        serializer.save()
        mock_instance.blacklist.assert_called_once()

    @patch('users.serializers.RefreshToken')
    def test_logout_invalid_token_raises_error(self, mock_refresh_token_class):
        """Test that invalid token raises ValidationError"""
        mock_refresh_token_class.side_effect = TokenError('Invalid token')
        
        serializer = LogoutSerializer(data={'refresh': 'invalid_token'})
        assert serializer.is_valid()
        
        with pytest.raises(ValidationError) as exc:
            serializer.save()
        
        assert "refresh" in exc.value.detail

    @patch('users.serializers.RefreshToken')
    def test_logout_expired_token_raises_error(self, mock_refresh_token_class):
        """Test that expired token raises ValidationError"""
        mock_instance = MagicMock()
        mock_instance.blacklist.side_effect = TokenError('Token is blacklisted')
        mock_refresh_token_class.return_value = mock_instance
        
        serializer = LogoutSerializer(data={'refresh': 'expired_token'})
        assert serializer.is_valid()
        
        with pytest.raises(ValidationError):
            serializer.save()

    def test_logout_missing_refresh_field_raises_error(self):
        """Test that missing refresh field raises ValidationError"""
        serializer = LogoutSerializer(data={})
        assert not serializer.is_valid()
