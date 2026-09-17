from django.db import transaction
from rest_framework import serializers

from apps.customers.models import CustomerProfile

from .models import (
    Role,
    User,
    VerificationCode,
    VerificationCodeChannel,
    VerificationCodePurpose,
)
from .otp import send_otp
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone_number",
            "role",
            "is_active",
            "is_verified",
            "created_at",
        ]
        read_only_fields = fields         


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
    def validate_password(self, value):
        validate_password(value)
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
            role=Role.CUSTOMER,            
        )
        CustomerProfile.objects.create(
            user=user, phone_number=phone, **validated_data
        )
        # Issue and deliver a verification code as part of registration.
        code, raw = VerificationCode.issue(
            user=user,
            purpose=VerificationCodePurpose.ACCOUNT_VERIFY,
            channel=VerificationCodeChannel.SMS,
        )
        send_otp(user, raw, channel=code.channel, purpose=code.purpose)

        return user


class VerifySerializer(serializers.Serializer):
    """
    Submit the OTP that was issued for ACCOUNT_VERIFY.

    Requires the user to be authenticated — the view enforces that.
    """

    code = serializers.CharField(min_length=6, max_length=6)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Code must be 6 digits.")
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField(max_length=254)


class ResetPasswordSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField(max_length=254)
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(
        min_length=8, write_only=True, style={"input_type": "password"}
    )

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Code must be 6 digits.")
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value