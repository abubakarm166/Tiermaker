from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer, UserAdminSerializer
from .permissions import IsAdminUser

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if getattr(self.user, "is_banned", False):
            from rest_framework_simplejwt.exceptions import AuthenticationFailed
            raise AuthenticationFailed("User account is banned.")
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserMeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserAdminSerializer
    queryset = User.objects.all().order_by("-created_at")


class UserAdminDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserAdminSerializer
    queryset = User.objects.all()

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        if "is_banned" in request.data:
            user.is_banned = bool(request.data["is_banned"])
        if "role" in request.data and request.data["role"] in (User.Role.USER, User.Role.ADMIN):
            user.role = request.data["role"]
        user.save()
        return Response(UserAdminSerializer(user).data)
