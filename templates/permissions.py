from rest_framework import permissions

from .models import Template


class IsOwnerOrAdminTemplate(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, "is_admin", False):
            return True
        if obj.created_by_id == request.user.id:
            return True
        # Allow read (GET, HEAD, OPTIONS) for public templates so others can create tier lists from them
        if request.method in permissions.SAFE_METHODS:
            return obj.visibility == Template.Visibility.PUBLIC
        return False

    def has_permission(self, request, view):
        # Allow public read. Write requires authentication; object-level checks handle ownership/admin.
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow public read; allow create/update/delete only for admin."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "is_admin", False))
