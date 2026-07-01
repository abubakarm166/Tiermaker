from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from .usernames import generate_random_username, validate_username_value


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, username=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        if username:
            username = validate_username_value(username)
        else:
            username = generate_random_username()
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        USER = "USER", "User"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=30, unique=True, db_index=True)
    twitter_id = models.CharField(max_length=32, unique=True, null=True, blank=True, db_index=True)
    x_username = models.CharField(max_length=50, blank=True, default="")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    is_banned = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username or self.email

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
