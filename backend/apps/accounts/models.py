from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


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