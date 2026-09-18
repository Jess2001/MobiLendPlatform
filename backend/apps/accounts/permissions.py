from rest_framework.permissions import BasePermission

from .models import Role


class HasRole(BasePermission):
    """
    Coarse-grained role gate. Subclass and set allowed_roles.

    UI visibility is NOT authorization (Doc §8.3) — every sensitive
    endpoint carries one of these explicitly.
    """
    allowed_roles: tuple[str, ...] = ()

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.is_active):
            return False
        if user.is_superuser:
            return True
        return user.role in self.allowed_roles


class IsCustomer(HasRole):
    allowed_roles = (Role.CUSTOMER,)


class IsCreditOfficer(HasRole):
    allowed_roles = (Role.CREDIT_OFFICER, Role.PARTNER_ADMIN)


class IsOperations(HasRole):
    allowed_roles = (Role.OPERATIONS,)


class IsFinance(HasRole):
    allowed_roles = (Role.FINANCE,)


class IsSuperadmin(HasRole):
    allowed_roles = (Role.SUPERADMIN,)


class IsOperationsOrFinance(HasRole):
    allowed_roles = (Role.OPERATIONS, Role.FINANCE)


class IsInternalStaff(HasRole):
    allowed_roles = (
        Role.PARTNER_ADMIN, Role.CREDIT_OFFICER,
        Role.OPERATIONS, Role.FINANCE, Role.SUPERADMIN,
    )


class IsVerifiedUser(BasePermission):
    """
    Requires the user to have completed account verification (is_verified=True).

    Deliberately NOT the default permission class — auth endpoints like /verify/
    and /password/forgot/ must remain reachable for unverified users.
    Attach this explicitly to domain endpoints (loans, applications, repayments).
    """

    message = "Account verification required."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.is_active):
            return False
        if user.is_superuser:
            return True
        return bool(getattr(user, "is_verified", False))
