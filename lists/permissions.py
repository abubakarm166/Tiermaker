from rest_framework import permissions


class IsOwnerOrAdminList(permissions.BasePermission):
    """Only the owner (or admin) can update or delete a tier list. Anyone authenticated can view public lists."""
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_admin:
            return True
        if obj.user_id == request.user.id:
            return True
        # For update, partial_update, destroy: only owner or admin may proceed (already handled above)
        if view.action in ("update", "partial_update", "destroy"):
            return False
        # Allow read (retrieve), export, and react for public lists
        if view.action in ("retrieve", "export", "react"):
            return getattr(obj, "visibility", None) == "PUBLIC"
        return False

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
