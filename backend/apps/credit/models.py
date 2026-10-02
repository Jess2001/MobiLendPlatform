from django.utils import timezone
from django.db import models
from apps.core.models import NumberSequence, TimeStampedModel
from apps.customers.models import CustomerProfile
# Create your models here.
class RepaymentFrequency(models.TextChoices):
    MONTHLY = "MONTHLY", "Monthly"


class LoanProduct(TimeStampedModel):
    code =models.CharField(max_length = 50 , unique=True)
    name = models.CharField(max_length=40)
    description = models.TextField(blank=True)
    minimum_amount = models.DecimalField(max_digits=14, decimal_places=2)
    maximum_amount = models.DecimalField(max_digits=14, decimal_places=2)
    processing_fee_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Processing fee rate as a percentage (e.g., 2.5 for 2.5%, 2.00 = 2%)",
    )
    repayment_frequency = models.CharField(
        max_length=20, choices=RepaymentFrequency.choices, default=RepaymentFrequency.MONTHLY
    )
    active = models.BooleanField(default=True, db_index=True)
    class Meta:
        ordering = ["code"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(minimum_amount__gt=0),
                name="loanproduct_min_amount_positive",
            ),
            models.CheckConstraint(
                condition=models.Q(maximum_amount__gt=models.F("minimum_amount")),
                name="loanproduct_max_amount_greater_than_minimum",
            ),
            models.CheckConstraint(
                condition=models.Q(processing_fee_rate__gte=0) & models.Q(processing_fee_rate__lte=100),
                name="loanproduct_processing_fee_rate_between_0_and_100",
            ),
        ]
    def __str__(self):
        return f"{self.code} - {self.name}"


class LoanProductTerm(TimeStampedModel):
    loan_product = models.ForeignKey(LoanProduct, on_delete=models.PROTECT, related_name="terms")
    term_in_months = models.PositiveSmallIntegerField()
    annual_interest_rate = models.DecimalField(max_digits=5 ,decimal_places=2)
    active = models.BooleanField(default=True)

    class Meta:
        constraints =[
            models.UniqueConstraint(
                fields=["loan_product", "term_in_months" ], name="unique_loan_product_term"
            ),
            models.CheckConstraint(
                condition =models.Q(term_in_months__gt=0) ,name="loanproductterm_term_in_months_positive"
            ),
            models.CheckConstraint(
                condition =models.Q(annual_interest_rate__gte=0) & models.Q(annual_interest_rate__lte=100) ,name="loanproductterm_annual_interest_rate_between_0_and_100")
        ]


class ApplicationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft" 
    SUBMITTED = "SUBMITTED", "Submitted" 
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review" 
    MORE_INFORMATION_REQUIRED = "MORE_INFORMATION_REQUIRED", "More Information Required"
    APPROVED = "APPROVED", "Approved"
    DECLINED = "DECLINED", "Declined"
    CANCELLED = "CANCELLED", "Cancelled"
    EXPIRED = "EXPIRED", "Expired" 
    LOAN_CREATED = "LOAN_CREATED", "Loan Created"


class LoanApplication(TimeStampedModel):
    application_number = models.CharField(max_length=20, unique=True, editable=False)
    loan_product = models.ForeignKey(
        LoanProduct, on_delete=models.PROTECT, related_name="loan_applications"
    )
    customer_profile = models.ForeignKey(
        CustomerProfile, on_delete=models.PROTECT, related_name="loan_applications"
    )
    term_in_months = models.PositiveSmallIntegerField()
    requested_amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(
        max_length=32,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.DRAFT,
        db_index=True,
    )
    purpose = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.application_number} - {self.status}"



    def save(self, *args, **kwargs):
        if not self.application_number:
            self.application_number = self._generate_application_number()
        super().save(*args, **kwargs)


    @staticmethod
    def _generate_application_number() -> str:
        year = timezone.now().year
        value = NumberSequence.next_value("APPLICATION_NUMBER", year)
        return f"APP-{year}-{value:05d}"

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(requested_amount__gt=0),
                name="loanapplication_requested_amount_positive"
            )
        ]
