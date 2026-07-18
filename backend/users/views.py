from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import RefreshToken

from users.serializers import LoginUserSerializer, CustomUserRegistrationSerializer, LogoutSerializer, UserProfileInfoSerializer, UpdateUserPasswordSerializer

# Create your views here.

#DEPRECATED
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginUserSerializer

    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

#DEPRECATED
class RegisterUserView(generics.CreateAPIView):
    serializer_class = CustomUserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "User registered successfully",
            "user": serializer.data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

#DEPRECATED
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(
            {"message": "Successfully logged out."}, 
            status=status.HTTP_204_NO_CONTENT
        )

class UserProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileInfoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

#DEPRECATED
class UpdateUserPasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        context = {
            "user": user
        }
        
        serializer = UpdateUserPasswordSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        
        serializer.save()
        
        return Response(data={"detail":"Password updated successfully"}, status=status.HTTP_200_OK)