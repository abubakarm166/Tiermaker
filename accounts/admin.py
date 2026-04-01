from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "role", "is_banned", "created_at")
    list_filter = ("role", "is_banned")
    search_fields = ("email",)
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissions", {"fields": ("role", "is_banned", "is_staff", "is_active")}),
        ("Dates", {"fields": ("created_at", "updated_at", "last_login")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
