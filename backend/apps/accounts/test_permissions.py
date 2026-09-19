import pytest
from django.test import RequestFactory

from apps.accounts.factories import UserFactory
from apps.accounts.models import Role
from apps.accounts.permissions import IsCreditOfficer, IsOperationsOrFinance


@pytest.fixture
def rf():
    return RequestFactory()


def _request_for(rf, role):
    user = UserFactory(role=role)
    request = rf.get("/")
    request.user = user
    return request


@pytest.mark.django_db
def test_customer_cannot_pass_credit_officer_gate(rf):
    request = _request_for(rf, Role.CUSTOMER)
    assert IsCreditOfficer().has_permission(request, None) is False


@pytest.mark.django_db
def test_credit_officer_passes(rf):
    request = _request_for(rf, Role.CREDIT_OFFICER)
    assert IsCreditOfficer().has_permission(request, None) is True


@pytest.mark.django_db
def test_operations_passes_composite_gate(rf):
    request = _request_for(rf, Role.OPERATIONS)
    assert IsOperationsOrFinance().has_permission(request, None) is True


@pytest.mark.django_db
def test_credit_officer_fails_composite_gate(rf):
    request = _request_for(rf, Role.CREDIT_OFFICER)
    assert IsOperationsOrFinance().has_permission(request, None) is False
