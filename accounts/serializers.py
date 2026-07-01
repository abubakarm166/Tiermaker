from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError

from .usernames import validate_username_value

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "x_username", "role", "is_banned", "created_at", "updated_at")
        read_only_fields = ("id", "email", "role", "is_banned", "created_at", "updated_at", "x_username")

    def validate_username(self, value):
        user_id = self.instance.pk if self.instance else None
        try:
            return validate_username_value(value, user_id=user_id)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages[0] if exc.messages else str(exc))


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "role", "is_banned", "created_at", "updated_at")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True, max_length=30)

    class Meta:
        model = User
        fields = ("email", "password", "username")

    def validate_username(self, value):
        raw = (value or "").strip()
        if not raw:
            return ""
        try:
            return validate_username_value(raw)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages[0] if exc.messages else str(exc))

    def create(self, validated_data):
        username = validated_data.pop("username", "") or None
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, username=username, **validated_data)
