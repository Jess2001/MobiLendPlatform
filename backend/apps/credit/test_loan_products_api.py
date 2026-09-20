import pytest

from .factories import LoanProductFactory, LoanProductTermFactory

URL = "/api/v1/loan-products/"


@pytest.mark.django_db
def test_authentication_required(api_client):
    response = api_client.get(URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_unverified_user_gets_forbidden(api_client, unverified_user):
    api_client.force_authenticate(user=unverified_user)
    response = api_client.get(URL)
    assert response.status_code == 403


@pytest.mark.django_db
def test_verified_user_gets_a_paginated_list(api_client, verified_user):
    LoanProductFactory(active=True)
    api_client.force_authenticate(user=verified_user)

    response = api_client.get(URL)

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert len(response.data["results"]) == 1


@pytest.mark.django_db
def test_only_active_products_are_returned(api_client, verified_user):
    active = LoanProductFactory(active=True)
    inactive = LoanProductFactory(active=False)
    api_client.force_authenticate(user=verified_user)

    response = api_client.get(URL)

    assert response.status_code == 200
    codes = [p["code"] for p in response.data["results"]]
    assert active.code in codes
    assert inactive.code not in codes


@pytest.mark.django_db
def test_only_active_terms_are_returned(api_client, verified_user):
    product = LoanProductFactory(active=True)
    LoanProductTermFactory(loan_product=product, term_in_months=3, active=True)
    LoanProductTermFactory(loan_product=product, term_in_months=6, active=False)
    api_client.force_authenticate(user=verified_user)

    response = api_client.get(URL)

    assert response.status_code == 200
    terms = response.data["results"][0]["terms"]
    assert [t["term_in_months"] for t in terms] == [3]


@pytest.mark.django_db
def test_terms_are_ordered_by_months(api_client, verified_user):
    product = LoanProductFactory(active=True)
    # deliberately created out of order
    LoanProductTermFactory(loan_product=product, term_in_months=12)
    LoanProductTermFactory(loan_product=product, term_in_months=6)
    LoanProductTermFactory(loan_product=product, term_in_months=24)
    api_client.force_authenticate(user=verified_user)

    response = api_client.get(URL)

    terms = response.data["results"][0]["terms"]
    assert [t["term_in_months"] for t in terms] == [6, 12, 24]


@pytest.mark.django_db
def test_listing_does_not_run_a_query_per_product(
    api_client, verified_user, django_assert_num_queries
):
    for _ in range(5):
        product = LoanProductFactory(active=True)
        LoanProductTermFactory(
            loan_product=product
        )  # the factory gives each a unique term
        LoanProductTermFactory(loan_product=product)
    api_client.force_authenticate(user=verified_user)

    # 1 pagination count + 1 products + 1 prefetched terms
    with django_assert_num_queries(3):
        response = api_client.get(URL)

    assert response.status_code == 200
