from django.urls import path
from . import views
from .password_reset import PasswordResetConfirmView, PasswordResetRequestView

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth_register"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="auth_login"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth_password_reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="auth_password_reset_confirm"),
    path("token/refresh/", views.CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.UserMeView.as_view(), name="auth_me"),
    path("users/", views.UserListView.as_view(), name="user_list"),
    path("users/<int:pk>/", views.UserAdminDetailView.as_view(), name="user_admin_detail"),
]
