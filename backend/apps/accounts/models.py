from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.conf import settings

class Role(models.TextChoices):
    CUSTOMER = "CUSTOMER", "Customer"
    PARTNER_ADMIN = "PARTNER_ADMIN", "Partner Admin"
    CREDIT_OFFICER = "CREDIT_OFFICER", "Credit Officer"
    OPERATIONS = "OPERATIONS", "Operations"
    FINANCE = "FINANCE", "Finance"
    SUPERADMIN = "SUPERADMIN", "Superadmin"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)  # hashes -> lands in .password
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", Role.CUSTOMER)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", Role.SUPERADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if extra_fields.get("role") != Role.SUPERADMIN:
            raise ValueError("Superuser must have role=SUPERADMIN.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Authentication identity. Deliberately holds NO financial data —
    that lives on CustomerProfile.
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=20, unique=True, null=True, blank=True,
        help_text="Login/contact number. Nullable for staff accounts.",
    )
    role = models.CharField(
        max_length=32, choices=Role.choices, default=Role.CUSTOMER, db_index=True
    )
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(
        default=False,
        help_text="Set to True after the user confirms ownership of phone or email via OTP.",
    )
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # AbstractBaseUser supplies: password, last_login
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        indexes = [models.Index(fields=["role", "is_active"])]

    def __str__(self):
        return self.email

    @property
    def is_customer(self) -> bool:
        return self.role == Role.CUSTOMER


class VerificationCodePurpose(models.TextChoices):
    ACCOUNT_VERIFY = "ACCOUNT_VERIFY", "Account verification"
    PASSWORD_RESET = "PASSWORD_RESET", "Password reset"


class VerificationCodeChannel(models.TextChoices):
    SMS = "SMS", "SMS"
    EMAIL = "EMAIL", "Email"


class VerificationCode(models.Model):
    """
    One-time code sent to a user for a specific purpose.

    Never stores the plaintext code — it is hashed like a password.
    Issuing a new code for the same (user, purpose) invalidates the previous one.
    """

    MAX_ATTEMPTS = 5
    TTL_MINUTES = 10

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="verification_codes",
    )
    code_hash = models.CharField(max_length=128)
    purpose = models.CharField(max_length=32, choices=VerificationCodePurpose.choices)
    channel = models.CharField(max_length=16, choices=VerificationCodeChannel.choices)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "purpose", "used_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.purpose} for user={self.user_id} ({self.channel})"

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    @property
    def is_used(self) -> bool:
        return self.used_at is not None

    @property
    def is_active(self) -> bool:
        return (
            not self.is_used
            and not self.is_expired
            and self.attempts < self.MAX_ATTEMPTS
        )

    @classmethod
    def issue(cls, user, purpose: str, channel: str) -> tuple["VerificationCode", str]:
        """
        Create a new code for the given (user, purpose).
        Invalidates any previous unused code for the same pair.
        Returns (code_instance, raw_code) — the caller is responsible for sending raw_code.
        """
        cls.objects.filter(
            user=user,
            purpose=purpose,
            used_at__isnull=True,
        ).update(used_at=timezone.now())

        raw = f"{secrets.randbelow(1_000_000):06d}"  # e.g. "048217"
        code = cls.objects.create(
            user=user,
            purpose=purpose,
            channel=channel,
            code_hash=make_password(raw),
            expires_at=timezone.now() + timedelta(minutes=cls.TTL_MINUTES),
        )
        return code, raw

    def check_and_consume(self, raw: str) -> tuple[bool, str | None]:
        """
        Verify a submitted code. On success, marks the code used.
        On failure, returns (False, reason) where reason is one of:
          "used" | "expired" | "too_many_attempts" | "wrong_code"
        """
        if self.is_used:
            return False, "used"
        if self.is_expired:
            return False, "expired"
        if self.attempts >= self.MAX_ATTEMPTS:
            return False, "too_many_attempts"

        if not check_password(raw, self.code_hash):
            self.attempts += 1
            self.save(update_fields=["attempts"])
            return False, "wrong_code"

        self.used_at = timezone.now()
        self.save(update_fields=["used_at"])
        return True, None
