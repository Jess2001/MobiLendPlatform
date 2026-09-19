from datetime import timedelta
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.accounts.factories import UserFactory
from apps.accounts.models import (
    Role,
    VerificationCode,
    VerificationCodeChannel,
    VerificationCodePurpose,
)

User = get_user_model()


# ---------------------------------------------------------------------
# User model
# ---------------------------------------------------------------------


@pytest.mark.django_db
def test_create_user_defaults():
    user = User.objects.create_user(email="a@example.com", password="pw12345678")
    assert user.role == Role.CUSTOMER
    assert user.is_staff is False
    assert user.check_password("pw12345678")
    assert user.password != "pw12345678"


@pytest.mark.django_db
def test_create_superuser():
    user = User.objects.create_superuser(
        email="root@example.com", password="pw12345678"
    )
    assert user.role == Role.SUPERADMIN
    assert user.is_staff is True
    assert user.is_superuser is True


@pytest.mark.django_db
def test_email_is_unique_at_db_level():
    User.objects.create_user(email="a@example.com", password="pw12345678")
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user(email="a@example.com", password="pw12345678")


# ---------------------------------------------------------------------
# Registration API
# ---------------------------------------------------------------------

REGISTER_URL = "/api/v1/auth/register/"


def _register_payload(**overrides):
    data = {
        "email": "amina@example.com",
        "password": "Str0ngPass!23",
        "phone_number": "+254712345678",
        "first_name": "Amina",
        "last_name": "Njeri",
    }
    data.update(overrides)
    return data


@pytest.mark.django_db
def test_register_creates_user_and_profile(api_client):
    response = api_client.post(REGISTER_URL, _register_payload(), format="json")
    assert response.status_code == 201
    user = User.objects.get(email="amina@example.com")
    assert user.role == Role.CUSTOMER
    assert user.customer_profile.customer_number.startswith("CUS-")


@pytest.mark.django_db
def test_register_issues_active_verification_code(api_client):
    api_client.post(REGISTER_URL, _register_payload(), format="json")
    user = User.objects.get(email="amina@example.com")
    code = VerificationCode.objects.filter(
        user=user, purpose=VerificationCodePurpose.ACCOUNT_VERIFY
    ).first()
    assert code is not None
    assert code.is_active


@pytest.mark.django_db
def test_register_returns_tokens(api_client):
    response = api_client.post(REGISTER_URL, _register_payload(), format="json")
    assert "tokens" in response.data
    assert "access" in response.data["tokens"]
    assert "refresh" in response.data["tokens"]


@pytest.mark.django_db
def test_duplicate_email_rejected(api_client):
    api_client.post(REGISTER_URL, _register_payload(), format="json")
    response = api_client.post(
        REGISTER_URL,
        _register_payload(phone_number="+254700000000"),
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_role_cannot_be_escalated_via_registration(api_client):
    payload = _register_payload()
    payload["role"] = "SUPERADMIN"
    api_client.post(REGISTER_URL, payload, format="json")
    assert User.objects.get(email="amina@example.com").role == Role.CUSTOMER


@pytest.mark.django_db
def test_profile_failure_rolls_back_user_creation(api_client):
    with patch(
        "apps.accounts.serializers.CustomerProfile.objects.create",
        side_effect=RuntimeError("boom"),
    ):
        with pytest.raises(RuntimeError):
            api_client.post(REGISTER_URL, _register_payload(), format="json")
    assert not User.objects.filter(email="amina@example.com").exists()


# ---------------------------------------------------------------------
# Verify account API
# ---------------------------------------------------------------------

VERIFY_URL = "/api/v1/auth/verify/"


@pytest.fixture
def issued_code(db):
    user = UserFactory()
    code, raw = VerificationCode.issue(
        user=user,
        purpose=VerificationCodePurpose.ACCOUNT_VERIFY,
        channel=VerificationCodeChannel.SMS,
    )
    return user, code, raw


@pytest.mark.django_db
def test_verify_with_correct_code_sets_is_verified(api_client, issued_code):
    user, code, raw = issued_code
    api_client.force_authenticate(user)
    response = api_client.post(VERIFY_URL, {"code": raw}, format="json")
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.is_verified
    code.refresh_from_db()
    assert code.used_at is not None


@pytest.mark.django_db
def test_verify_with_wrong_code_fails(api_client, issued_code):
    user, code, _raw = issued_code
    api_client.force_authenticate(user)
    response = api_client.post(VERIFY_URL, {"code": "000000"}, format="json")
    assert response.status_code == 400
    assert response.data["reason"] == "wrong_code"
    code.refresh_from_db()
    assert code.attempts == 1
    user.refresh_from_db()
    assert user.is_verified is False


@pytest.mark.django_db
def test_verify_with_expired_code_fails(api_client, issued_code):
    user, code, raw = issued_code
    code.expires_at = timezone.now() - timedelta(minutes=1)
    code.save(update_fields=["expires_at"])
    api_client.force_authenticate(user)
    response = api_client.post(VERIFY_URL, {"code": raw}, format="json")
    assert response.status_code == 400
    assert response.data["reason"] == "expired"


@pytest.mark.django_db
def test_verify_second_submission_is_rejected(api_client, issued_code):
    """After a successful verify, a second submission is rejected as already_verified."""
    user, _code, raw = issued_code
    api_client.force_authenticate(user)
    api_client.post(VERIFY_URL, {"code": raw}, format="json")  # first — succeeds
    response = api_client.post(VERIFY_URL, {"code": raw}, format="json")
    assert response.status_code == 400
    assert response.data["reason"] == "already_verified"


@pytest.mark.django_db
def test_verify_requires_authentication(api_client, issued_code):
    _user, _code, raw = issued_code
    response = api_client.post(VERIFY_URL, {"code": raw}, format="json")
    assert response.status_code == 401

# ---------------------------------------------------------------------
# Forgot / reset password
# ---------------------------------------------------------------------

FORGOT_URL = "/api/v1/auth/password/forgot/"
RESET_URL = "/api/v1/auth/password/reset/"


@pytest.mark.django_db
def test_forgot_password_returns_neutral_for_existing_user(api_client):
    user = UserFactory(email="test@example.com", phone_number="+254700000001")
    response = api_client.post(
        FORGOT_URL, {"email_or_phone": "test@example.com"}, format="json"
    )
    assert response.status_code == 200
    assert "If an account matches" in response.data["detail"]
    # A PASSWORD_RESET code was issued
    assert VerificationCode.objects.filter(
        user=user, purpose=VerificationCodePurpose.PASSWORD_RESET
    ).exists()


@pytest.mark.django_db
def test_forgot_password_returns_neutral_for_unknown_user(api_client):
    response = api_client.post(
        FORGOT_URL, {"email_or_phone": "nobody@example.com"}, format="json"
    )
    assert response.status_code == 200
    assert "If an account matches" in response.data["detail"]


@pytest.mark.django_db
def test_reset_password_happy_path(api_client):
    user = UserFactory(
        email="test@example.com",
        phone_number="+254700000001",
        password="OldPass!23",
    )
    code, raw = VerificationCode.issue(
        user=user,
        purpose=VerificationCodePurpose.PASSWORD_RESET,
        channel=VerificationCodeChannel.EMAIL,
    )
    response = api_client.post(
        RESET_URL,
        {
            "email_or_phone": "test@example.com",
            "code": raw,
            "new_password": "NewPass!23",
        },
        format="json",
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("NewPass!23")
    assert not user.check_password("OldPass!23")


@pytest.mark.django_db
def test_reset_password_with_wrong_code_fails(api_client):
    user = UserFactory(email="test@example.com", password="OldPass!23")
    VerificationCode.issue(
        user=user,
        purpose=VerificationCodePurpose.PASSWORD_RESET,
        channel=VerificationCodeChannel.EMAIL,
    )
    response = api_client.post(
        RESET_URL,
        {
            "email_or_phone": "test@example.com",
            "code": "000000",
            "new_password": "NewPass!23",
        },
        format="json",
    )
    assert response.status_code == 400
    assert response.data["reason"] == "invalid_or_expired"
    user.refresh_from_db()
    assert user.check_password("OldPass!23")  # unchanged


@pytest.mark.django_db
def test_reset_password_with_unknown_identifier_fails(api_client):
    response = api_client.post(
        RESET_URL,
        {
            "email_or_phone": "nobody@example.com",
            "code": "123456",
            "new_password": "NewPass!23",
        },
        format="json",
    )
    assert response.status_code == 400
    assert response.data["reason"] == "invalid_or_expired"


# ---------------------------------------------------------------------
# Password validators
# ---------------------------------------------------------------------

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password


@pytest.mark.parametrize(
    "password, should_pass",
    [
        ("Short1A", False),  # too short (7)
        ("alllowercase1", False),  # no uppercase
        ("ALLUPPERCASE1", False),  # no lowercase
        ("NoDigitsHere!", False),  # no digit
        ("GoodPass1", True),  # valid
    ],
)
def test_password_complexity_validator(password, should_pass):
    if should_pass:
        validate_password(password)
    else:
        with pytest.raises(ValidationError):
            validate_password(password)


@pytest.mark.django_db
def test_register_rejects_weak_password(api_client):
    response = api_client.post(
        REGISTER_URL,
        _register_payload(password="weakpassword"),  # no upper, no digit
        format="json",
    )
    assert response.status_code == 400
    assert "password" in response.data


# ---------------------------------------------------------------------
# IsVerifiedUser permission
# ---------------------------------------------------------------------

from apps.accounts.permissions import IsVerifiedUser
from django.test import RequestFactory


@pytest.mark.django_db
def test_verified_user_passes_isverified_gate():
    user = UserFactory(is_verified=True)
    request = RequestFactory().get("/")
    request.user = user
    assert IsVerifiedUser().has_permission(request, None) is True


@pytest.mark.django_db
def test_unverified_user_fails_isverified_gate():
    user = UserFactory(is_verified=False)
    request = RequestFactory().get("/")
    request.user = user
    assert IsVerifiedUser().has_permission(request, None) is False


@pytest.mark.django_db
def test_superuser_bypasses_isverified_gate():
    user = UserFactory(is_superuser=True, is_verified=False)
    request = RequestFactory().get("/")
    request.user = user
    assert IsVerifiedUser().has_permission(request, None) is True


# ---------------------------------------------------------------------
# Login API
# ---------------------------------------------------------------------

LOGIN_URL = "/api/v1/auth/login/"


@pytest.mark.django_db
def test_login_with_email_returns_tokens_and_user(api_client):
    UserFactory(email="test@example.com", phone_number="+254700000001")
    response = api_client.post(
        LOGIN_URL,
        {"email_or_phone": "test@example.com", "password": "Str0ngPass!23"},
        format="json",
    )
    assert response.status_code == 200
    assert "tokens" in response.data
    assert "access" in response.data["tokens"]
    assert "refresh" in response.data["tokens"]
    assert response.data["user"]["email"] == "test@example.com"


@pytest.mark.django_db
def test_login_with_phone_returns_tokens(api_client):
    UserFactory(email="test@example.com", phone_number="+254700000001")
    response = api_client.post(
        LOGIN_URL,
        {"email_or_phone": "+254700000001", "password": "Str0ngPass!23"},
        format="json",
    )
    assert response.status_code == 200
    assert "tokens" in response.data


@pytest.mark.django_db
def test_login_with_email_is_case_insensitive(api_client):
    UserFactory(email="test@example.com", phone_number="+254700000001")
    response = api_client.post(
        LOGIN_URL,
        {"email_or_phone": "TEST@example.com", "password": "Str0ngPass!23"},
        format="json",
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_login_with_wrong_password_fails(api_client):
    UserFactory(email="test@example.com")
    response = api_client.post(
        LOGIN_URL,
        {"email_or_phone": "test@example.com", "password": "WrongPass!23"},
        format="json",
    )
    assert response.status_code == 401
    assert response.data["reason"] == "invalid_credentials"


@pytest.mark.django_db
def test_login_with_unknown_identifier_returns_same_error(api_client):
    response = api_client.post(
        LOGIN_URL,
        {"email_or_phone": "nobody@example.com", "password": "Str0ngPass!23"},
        format="json",
    )
    assert response.status_code == 401
    assert response.data["reason"] == "invalid_credentials"


@pytest.mark.django_db
def test_login_with_inactive_user_fails(api_client):
    UserFactory(email="test@example.com", is_active=False)
    response = api_client.post(
        LOGIN_URL,
        {"email_or_phone": "test@example.com", "password": "Str0ngPass!23"},
        format="json",
    )
    assert response.status_code == 401
    assert response.data["reason"] == "account_inactive"


@pytest.mark.django_db
def test_resend_issues_new_code_and_invalidates_old(api_client):
    user = UserFactory()
    old_code, _old_raw = VerificationCode.issue(
        user=user,
        purpose=VerificationCodePurpose.ACCOUNT_VERIFY,
        channel=VerificationCodeChannel.SMS,
    )
    api_client.force_authenticate(user)
    response = api_client.post("/api/v1/auth/verify/resend/", format="json")
    assert response.status_code == 200
    old_code.refresh_from_db()
    assert old_code.used_at is not None  # invalidated
    assert (
        VerificationCode.objects.filter(
            user=user,
            purpose=VerificationCodePurpose.ACCOUNT_VERIFY,
            used_at__isnull=True,
        ).count()
        == 1
    )


@pytest.mark.django_db
def test_resend_rejected_when_already_verified(api_client):
    user = UserFactory(is_verified=True)
    api_client.force_authenticate(user)
    response = api_client.post("/api/v1/auth/verify/resend/", format="json")
    assert response.status_code == 400
    assert response.data["reason"] == "already_verified"

# ---------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------


@pytest.mark.django_db
def test_login_is_rate_limited(api_client):
    UserFactory(email="test@example.com")
    payload = {"email_or_phone": "test@example.com", "password": "WrongPass!23"}

    # Budget is 5/min — consume it.
    for _ in range(5):
        api_client.post(LOGIN_URL, payload, format="json")

    response = api_client.post(LOGIN_URL, payload, format="json")
    assert response.status_code == 429
    assert response.data["reason"] == "too_many_attempts"


@pytest.mark.django_db
def test_verify_resend_is_rate_limited(api_client):
    user = UserFactory()
    api_client.force_authenticate(user)
    url = "/api/v1/auth/verify/resend/"

    for _ in range(3):
        api_client.post(url, format="json")

    response = api_client.post(url, format="json")
    assert response.status_code == 429
    assert response.data["reason"] == "too_many_attempts"


@pytest.mark.django_db
def test_password_forgot_is_rate_limited(api_client):
    payload = {"email_or_phone": "nobody@example.com"}

    for _ in range(3):
        api_client.post(FORGOT_URL, payload, format="json")

    response = api_client.post(FORGOT_URL, payload, format="json")
    assert response.status_code == 429
    assert response.data["reason"] == "too_many_attempts"


@pytest.mark.django_db
def test_throttle_returns_retry_after(api_client):
    UserFactory(email="test@example.com")
    payload = {"email_or_phone": "test@example.com", "password": "WrongPass!23"}
    for _ in range(5):
        api_client.post(LOGIN_URL, payload, format="json")
    response = api_client.post(LOGIN_URL, payload, format="json")
    assert response.status_code == 429
    assert response.data["retry_after_seconds"] is not None
    assert response.data["retry_after_seconds"] > 0
