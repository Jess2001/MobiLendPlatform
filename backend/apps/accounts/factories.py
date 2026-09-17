import factory
from django.contrib.auth import get_user_model

from apps.accounts.models import (
    Role,
    VerificationCode,
    VerificationCodeChannel,
    VerificationCodePurpose,
)

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("email",)

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    phone_number = factory.Sequence(lambda n: f"+2547{n:08d}")
    role = Role.CUSTOMER
    is_active = True
    is_verified = False
    password = factory.PostGenerationMethodCall("set_password", "Str0ngPass!23")


class VerificationCodeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = VerificationCode

    user = factory.SubFactory(UserFactory)
    purpose = VerificationCodePurpose.ACCOUNT_VERIFY
    channel = VerificationCodeChannel.SMS
