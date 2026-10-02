from django.test import TestCase
import pytest
from .factories import (
    LoanProductFactory,
    LoanProductTermFactory,
    LoanApplicationFactory,
)
from django.utils import timezone
import re
# Create your tests here.
from django.db import IntegrityError, transaction
from .services import InvalidTransition, transition
from decimal import Decimal
@pytest.mark.django_db
def test_a_valid_produt_can_be_created():
    product = LoanProductFactory()
    assert product.pk is not None
    assert product.code.startswith("LP")


@pytest.mark.django_db
def test_product_minimum_amount_constraints():
    # Test that creating a product with minimum_amount <= 0 raises an error
    with pytest.raises(
        IntegrityError, match="loanproduct_min_amount_positive"),\
              transaction.atomic():
        LoanProductFactory(minimum_amount=Decimal("0"))
@pytest.mark.django_db
@pytest.mark.parametrize("minimum_amount, maximum_amount", [(50000,10000), (10000, 10000)])
def test_product_maximum_amount_constraints(minimum_amount, maximum_amount):
    # Test that creating a product with maximum_amount <= minimum_amount raises an error
    with pytest.raises(IntegrityError, match="loanproduct_max_amount_greater_than_minimum"),\
          transaction.atomic():
        LoanProductFactory(minimum_amount=minimum_amount, maximum_amount=maximum_amount)
@pytest.mark.django_db
@pytest.mark.parametrize("bad_rate", [-1, 101, Decimal("-0.01"), Decimal("100.01")])
def test_fee_rate_outside_0_to_100_is_rejected(bad_rate):
    # Test that creating a product with processing_fee_rate < 0 or >100 raises an error
    with pytest.raises(IntegrityError, match="loanproduct_processing_fee_rate_between_0_and_100"),\
          transaction.atomic():
        LoanProductFactory(processing_fee_rate=bad_rate)


@pytest.mark.django_db
def test_zero_processing_fee_rate_is_valid():
    product = LoanProductFactory(processing_fee_rate=0)
    product.refresh_from_db()
    assert product.processing_fee_rate == 0
@pytest.mark.django_db
def test_maximum_processing_fee_rate_is_valid():
    product = LoanProductFactory(processing_fee_rate=100)
    assert product.processing_fee_rate == 100
@pytest.mark.django_db
def test_duplicate_product_term_rejected():
    product = LoanProductFactory()
    # Create a term for the product
    LoanProductTermFactory(loan_product=product, term_in_months=12)
    # Attempt to create a duplicate term for the same product
    with pytest.raises(IntegrityError, match="unique_loan_product_term"),\
            transaction.atomic():
        LoanProductTermFactory(loan_product=product, term_in_months=12)

@pytest.mark.django_db
def test_same_term_length_on_different_products_is_valid():
    product1 = LoanProductFactory()
    product2 = LoanProductFactory()
    # Create a term for the first product
    LoanProductTermFactory(loan_product=product1, term_in_months=12)
    # Create a term with the same length for the second product
    term2 = LoanProductTermFactory(loan_product=product2, term_in_months=12)
    assert term2.pk is not None

@pytest.mark.django_db
@pytest.mark.parametrize("valid_rate",[0,100])
def test_annual_rate_0_or_100_is_valid(valid_rate):
    product = LoanProductFactory()
    # Test that creating a term with annual_interest_rate  0 or 100 is valid
    term = LoanProductTermFactory(loan_product=product, annual_interest_rate=valid_rate)
    assert term.pk is not None

@pytest.mark.django_db
@pytest.mark.parametrize("bad_rate", [-1, 101, Decimal("-0.01"), Decimal("100.01")])
def test_annual_rate_outside_0_to_100_rejected(bad_rate):
    product = LoanProductFactory()
    # Test that creating a term with annual_interest_rate < 0 or >100 raises an error
    with pytest.raises(IntegrityError, match="loanproductterm_annual_interest_rate_between_0_and_100"),\
            transaction.atomic():
        LoanProductTermFactory(loan_product=product, annual_interest_rate=bad_rate)

@pytest.mark.django_db
def test_product_term_month_constraints():
    product = LoanProductFactory()
    # Test that creating a term with term_in_months = 0 raises an error
    with pytest.raises(IntegrityError, match="loanproductterm_term_in_months_positive"),\
            transaction.atomic():
        LoanProductTermFactory(loan_product=product, term_in_months=0)

@pytest.mark.django_db
def test_requested_amount_greater_than_zero():
    product = LoanProductFactory()
    # Test that creating a loan application with requested_amount <= 0 raises an error
    with pytest.raises(IntegrityError, match="loanapplication_requested_amount_positive")\
            , transaction.atomic():
        LoanApplicationFactory(loan_product=product, requested_amount=Decimal("0"))

@pytest.mark.django_db
def test_default_status_is_draft():
    product = LoanProductFactory()
    application = LoanApplicationFactory(loan_product=product)
    assert application.status == "DRAFT"


@pytest.mark.django_db
def test_application_numbers_are_generated_and_sequential():
    first = LoanApplicationFactory()
    second = LoanApplicationFactory()

    year = timezone.now().year
    assert re.fullmatch(rf"APP-{year}-\d{{5}}", first.application_number)
    first_seq = int(first.application_number.split("-")[-1])
    second_seq = int(second.application_number.split("-")[-1])
    assert second_seq == first_seq + 1


@pytest.mark.django_db
def test_submitted_at_is_empty_until_submission():
    application = LoanApplicationFactory()
    assert application.submitted_at is None


@pytest.mark.django_db
@pytest.mark.parametrize("new_status",["SUBMITTED", "CANCELLED", "EXPIRED"])
def test_draft_transitions_work(new_status):
    application = LoanApplicationFactory()
    transition(application.id, new_status)
    application.refresh_from_db()
    assert application.status == new_status


@pytest.mark.django_db
@pytest.mark.parametrize("new_status",["UNDER_REVIEW", "CANCELLED", "EXPIRED"])
def test_submitted_transitions_work(new_status):
    application = LoanApplicationFactory(status="SUBMITTED")
    transition(application.id, new_status)
    application.refresh_from_db()
    assert application.status == new_status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "new_status",["MORE_INFORMATION_REQUIRED", "APPROVED", "DECLINED", "EXPIRED"]
)
def test_under_review_transitions_work(new_status):
    application = LoanApplicationFactory(status="UNDER_REVIEW")
    transition(application.id, new_status)
    application.refresh_from_db()
    assert application.status == new_status


@pytest.mark.django_db
@pytest.mark.parametrize("new_status",["UNDER_REVIEW", "CANCELLED", "EXPIRED"])
def test_more_info_transitions_work(new_status):
    application = LoanApplicationFactory(status="MORE_INFORMATION_REQUIRED")
    transition(application.id, new_status)
    application.refresh_from_db()
    assert application.status == new_status


@pytest.mark.django_db
@pytest.mark.parametrize("new_status",["LOAN_CREATED", "EXPIRED"])
def test_approved_transitions_work(new_status):
    application = LoanApplicationFactory(status="APPROVED")
    transition(application.id, new_status)
    application.refresh_from_db()
    assert application.status == new_status


@pytest.mark.django_db
def test_submitted_transitions_has_submitted_at():
    application = LoanApplicationFactory()
    transition(application.id, "SUBMITTED")
    application.refresh_from_db()
    assert application.submitted_at is not None 


@pytest.mark.django_db
@pytest.mark.parametrize(
    "current_status,new_status",
    [
        ("DRAFT", "APPROVED"),
        ("DECLINED", "APPROVED"),
        ("APPROVED", "DECLINED"),
        ("LOAN_CREATED", "DRAFT"),
    ],
)
def test_invalid_transitions_fail(current_status, new_status):
    application = LoanApplicationFactory(status=current_status)
    with pytest.raises(InvalidTransition):
        transition(application.id, new_status)
    application.refresh_from_db()
    assert application.status == current_status
