from django.test import TestCase
import pytest
from .factories import LoanProductFactory, LoanProductTermFactory
# Create your tests here.
from django.db import IntegrityError, transaction
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
