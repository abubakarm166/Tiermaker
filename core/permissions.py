from rest_framework import permissions


class IsNotBannedUser(permissions.BasePermission):
    """Deny access if user is banned. Use with IsAuthenticated."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return True
        return not getattr(request.user, "is_banned", False)
