from rest_framework import permissions
from .models import User


class IsAdminRole(permissions.BasePermission):
    """Allows access only to users with the ADMIN role."""
    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        return bool(
            request.user and
            request.user.is_authenticated and
            isinstance(request.user, User) and
            request.user.role == User.Role.ADMIN
        )


class IsASMRole(permissions.BasePermission):
    """Allows access to Area Sales Managers."""
    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        return bool(
            request.user and
            request.user.is_authenticated and
            isinstance(request.user, User) and
            request.user.role == User.Role.ASM
        )


class IsTelecallerRole(permissions.BasePermission):
    """Allows access to Telecallers."""
    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        return bool(
            request.user and
            request.user.is_authenticated and
            isinstance(request.user, User) and
            request.user.role == User.Role.TELECALLER
        )


class IsAdminOrASM(permissions.BasePermission):
    """Allows access to Admins or Area Sales Managers."""
    def has_permission(self, request, view) -> bool:  # type: ignore[override]
        return bool(
            request.user and
            request.user.is_authenticated and
            isinstance(request.user, User) and
            request.user.role in (User.Role.ADMIN, User.Role.ASM)
        )


class IsLeadOwnerOrManager(permissions.BasePermission):
    """
    Object-level permission:
    - Admins have full access to any lead.
    - ASMs have access if lead or telecaller is within their territory.
    - Telecallers have access ONLY if explicitly assigned to this lead.
    """
    def has_object_permission(self, request, view, obj) -> bool:  # type: ignore[override]
        user = request.user
        if not user or not user.is_authenticated or not isinstance(user, User):
            return False

        if user.role == User.Role.ADMIN:
            return True

        if user.role == User.Role.ASM:
            if not user.territory:
                return True
            lead_city = (obj.customer.city or "").lower()
            caller_territory = (obj.assigned_to.territory if obj.assigned_to else "").lower()
            asm_territory = user.territory.lower()
            return asm_territory in lead_city or asm_territory in caller_territory

        if user.role == User.Role.TELECALLER:
            return obj.assigned_to_id == user.id

        return False
