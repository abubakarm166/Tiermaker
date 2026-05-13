from rest_framework import permissions


class IsOwnerOrAdminList(permissions.BasePermission):
    """Only the owner (or admin) can update or delete a tier list. Anyone authenticated can view public lists."""
    def has_object_permission(self, request, view, obj):
        user = request.user
        if getattr(user, "is_authenticated", False) and getattr(user, "is_admin", False):
            return True
        if getattr(user, "is_authenticated", False) and obj.user_id == user.id:
            return True
        # Public read is allowed; write/export/react still require auth (enforced at view level).
        if request.method in permissions.SAFE_METHODS:
            return getattr(obj, "visibility", None) == "PUBLIC"
        return False

    def has_permission(self, request, view):
        # Public read allowed. Write permissions are enforced by view-level permissions.
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)
