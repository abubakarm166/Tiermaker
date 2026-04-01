from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth_register"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="auth_login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.UserMeView.as_view(), name="auth_me"),
    path("users/", views.UserListView.as_view(), name="user_list"),
    path("users/<int:pk>/", views.UserAdminDetailView.as_view(), name="user_admin_detail"),
]
