from django.db import transaction
from rest_framework import serializers

from apps.customers.models import CustomerProfile

from .models import Role, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "phone_number", "role", "is_active", "created_at"]
        read_only_fields = fields          # role is NEVER client-writable


class RegisterSerializer(serializers.Serializer):
    """
    Customer self-registration. Creates User + CustomerProfile atomically —
    a User without a CustomerProfile is a broken customer.
    """
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, min_length=8, style={"input_type": "password"}
    )
    phone_number = serializers.CharField(max_length=20)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "A user with this phone number already exists."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        phone = validated_data.pop("phone_number")

        user = User.objects.create_user(
            email=email,
            password=password,
            phone_number=phone,
            role=Role.CUSTOMER,            # hardcoded — no escalation path
        )
        CustomerProfile.objects.create(
            user=user, phone_number=phone, **validated_data
        )
        return user