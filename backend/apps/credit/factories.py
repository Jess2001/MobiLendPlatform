import factory
from .models import LoanProduct, LoanProductTerm, LoanApplication
from decimal import Decimal
from apps.customers.factories import CustomerProfileFactory
class LoanProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LoanProduct

    code = factory.Sequence(lambda n: f"LP{n:04d}")
    name = factory.Sequence(lambda n: f"Loan Product {n}")
    description = factory.Faker("paragraph", nb_sentences=3)
    minimum_amount = Decimal("10000.00")
    maximum_amount = Decimal("100000.00")


class LoanProductTermFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LoanProductTerm

    loan_product = factory.SubFactory(LoanProductFactory)
    term_in_months = factory.Sequence(lambda n: n + 1)
    annual_interest_rate = Decimal("20.00")

class LoanApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LoanApplication

    loan_product = factory.SubFactory(LoanProductFactory)
    customer_profile = factory.SubFactory(CustomerProfileFactory)
    term_in_months = 12
    requested_amount = Decimal("50000.00")
    
