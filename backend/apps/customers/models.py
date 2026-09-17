from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import NumberSequence, TimeStampedModel


class EmploymentStatus(models.TextChoices):
    EMPLOYED = "EMPLOYED", "Employed"
    SELF_EMPLOYED = "SELF_EMPLOYED", "Self-employed"
    BUSINESS_OWNER = "BUSINESS_OWNER", "Business owner"
    UNEMPLOYED = "UNEMPLOYED", "Unemployed"
    STUDENT = "STUDENT", "Student"
    RETIRED = "RETIRED", "Retired"


class CustomerProfile(TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,          # never cascade a financial record away
        related_name="customer_profile",
    )
    customer_number = models.CharField(max_length=20, unique=True, editable=False)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    national_id = models.CharField(max_length=20, unique=True, null=True, blank=True)

    employment_status = models.CharField(
        max_length=32, choices=EmploymentStatus.choices, blank=True
    )
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monthly_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    phone_number = models.CharField(max_length=20, db_index=True)
    address = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(monthly_income__gte=0),
                name="customer_income_non_negative",
            ),
            models.CheckConstraint(
                check=models.Q(monthly_expenses__gte=0),
                name="customer_expenses_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.customer_number} — {self.first_name} {self.last_name}"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        if not self.customer_number:
            self.customer_number = self._generate_customer_number()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_customer_number() -> str:
        year = timezone.now().year
        value = NumberSequence.next_value("CUSTOMER", year)
        return f"CUS-{year}-{value:05d}"
