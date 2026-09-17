from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase


from apps.accounts.models import Role
from apps.accounts.permissions import IsCreditOfficer, IsOperationsOrFinance

User = get_user_model()


class RolePermissionTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def _request_for(self, role):
        user = User.objects.create_user(email=f"{role}@x.com", password="pw12345678",
                                        role=role)
        request = self.factory.get("/")
        request.user = user
        return request

    def test_customer_cannot_pass_credit_officer_gate(self):
        self.assertFalse(IsCreditOfficer().has_permission(
            self._request_for(Role.CUSTOMER), None))

    def test_credit_officer_passes(self):
        self.assertTrue(IsCreditOfficer().has_permission(
            self._request_for(Role.CREDIT_OFFICER), None))

    def test_operations_passes_composite_gate(self):
        self.assertTrue(IsOperationsOrFinance().has_permission(
            self._request_for(Role.OPERATIONS), None))

    def test_credit_officer_fails_composite_gate(self):
        self.assertFalse(IsOperationsOrFinance().has_permission(
            self._request_for(Role.CREDIT_OFFICER), None))