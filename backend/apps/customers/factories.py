import factory

from apps.accounts.factories import UserFactory
from apps.customers.models import CustomerProfile


class CustomerProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomerProfile

    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    phone_number = factory.LazyAttribute(lambda o: o.user.phone_number)
