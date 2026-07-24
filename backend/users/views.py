from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import RefreshToken

from users.serializers import CustomUserDetailsSerializer

# Create your views here.


class UserProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomUserDetailsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user