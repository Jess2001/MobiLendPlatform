import re

import pytest

from apps.customers.factories import CustomerProfileFactory

ME_URL = "/api/v1/customers/me/"


@pytest.mark.django_db
def test_requires_authentication(api_client):
    response = api_client.get(ME_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_returns_own_profile(api_client):
    profile = CustomerProfileFactory()
    api_client.force_authenticate(profile.user)
    response = api_client.get(ME_URL)
    assert response.status_code == 200
    assert response.data["customer_number"] == profile.customer_number


@pytest.mark.django_db
def test_does_not_leak_sensitive_fields(api_client):
    profile = CustomerProfileFactory(
        national_id="12345678",
        monthly_income=80000,
        monthly_expenses=35000,
    )
    api_client.force_authenticate(profile.user)
    data = api_client.get(ME_URL).data
    for field in (
        "national_id",
        "monthly_income",
        "monthly_expenses",
        "date_of_birth",
    ):
        assert field not in data


@pytest.mark.django_db
def test_customer_number_is_generated_and_unique():
    p1 = CustomerProfileFactory()
    p2 = CustomerProfileFactory()
    assert p1.customer_number != p2.customer_number
    assert re.match(r"^CUS-\d{4}-\d{5}$", p1.customer_number)
    assert re.match(r"^CUS-\d{4}-\d{5}$", p2.customer_number)
