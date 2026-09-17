from rest_framework import serializers

from .models import CustomerProfile


class CustomerProfileSelfSerializer(serializers.ModelSerializer):
    """
    Least-privilege view (Doc §3.2). Deliberately EXCLUDES:
      national_id, date_of_birth, monthly_income, monthly_expenses.

    A customer editing their own contact details does not need their
    income returned in the response.
    """
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            "customer_number", "first_name", "last_name", "full_name",
            "phone_number", "employment_status", "address",
            "created_at", "updated_at",
        ]
        read_only_fields = ["customer_number", "created_at", "updated_at"]


class CustomerProfileStaffSerializer(serializers.ModelSerializer):
    """Full record — credit officers, operations, finance."""
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = "__all__"
        read_only_fields = ["customer_number", "created_at", "updated_at"]