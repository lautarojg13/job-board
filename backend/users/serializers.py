from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from allauth.account.utils import filter_users_by_email
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from drf_spectacular.utils import extend_schema_serializer, OpenApiExample
from rest_framework import serializers

from users.models import CustomUser

class CustomUserRegistrationSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    
    def validate_email(self, email):
        if filter_users_by_email(email):
            raise serializers.ValidationError(
                "A user is already registered with this e-mail address."
            )

        return email
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        
        data.update({
            'username':self.validated_data.get("username", ""),
            'email':self.validated_data.get("email", ""),
            'first_name':self.validated_data.get("first_name", ""),
            'last_name':self.validated_data.get("last_name", ""),
        })
        
        return data
    
    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        
        user = adapter.save_user(request, user, self, commit=True)
        
        return user
    

class CustomUserDetailsSerializer(UserDetailsSerializer):

    class Meta(UserDetailsSerializer.Meta):
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
        )
        read_only_fields = ("email","role")
  

# DEPRECATED 
# class UpdateUserPasswordSerializer(serializers.Serializer):
#     old_password = serializers.CharField(write_only=True)
#     new_password = serializers.CharField(write_only=True, min_length=8)
#     new_password2 = serializers.CharField(write_only=True, min_length=8)
    
#     def validate_old_password(self, value):
#         user = self.context["user"]
        
#         if not user.check_password(value):
#             raise ValidationError("Provided password is not correct.")
        
#         return value
    
#     def validate(self, data):
#         new_password = data.get("new_password")
#         new_password2 = data.get("new_password2")
        
#         if new_password != new_password2:
#             raise ValidationError("Provided new passwords don't match.")
        
#         validate_password(new_password, user=self.context["user"])
        
#         return data
    
#     def save(self):
        
#         user = self.context["user"]
        
#         user.set_password(self.validated_data["new_password"])
#         user.save()
        
#         return user
    
    
    
    
# DEPRECATED
# class LoginUserSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField(write_only=True)
    
#     def validate(self, attrs):
#         username = attrs.get('username')
#         password = attrs.get('password')

#         if username and password:
#             user = authenticate(username=username, password=password)
#             if not user:
#                 raise serializers.ValidationError('Invalid credentials.')
            
#             if not user.is_active:
#                 raise serializers.ValidationError('User is disabled.')
#         else:
#             raise serializers.ValidationError('Must include "username" and "password".')

#         refresh = RefreshToken.for_user(user)
        
#         return {
#             'user': UserProfileInfoSerializer(user).data,
#             'access': str(refresh.access_token),
#             'refresh': str(refresh),
#             'access_expires': int(refresh.access_token.lifetime.total_seconds()),
#             'refresh_expires': int(refresh.lifetime.total_seconds())
#         }


# DEPRECATED  
# class LogoutSerializer(serializers.Serializer):
#     refresh = serializers.CharField()

#     def validate(self, attrs):
#         self.token = attrs['refresh']
#         return attrs

#     def save(self, **kwargs):
#         try:
#             RefreshToken(self.token).blacklist()
#         except TokenError:
#             raise serializers.ValidationError({'refresh': 'Invalid or expired token'})


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Token pair",
            value={"access": "...", "refresh": "..."},
            response_only=True,
            status_codes=["200"],
        ),
    ],
)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        email_verified = EmailAddress.objects.filter(
            user=user, verified=True
        ).exists()
        if not email_verified:
            raise serializers.ValidationError(
                "Email not verified. Please verify your email before logging in."
            )
        return data