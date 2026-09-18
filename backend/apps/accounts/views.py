from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.identifiers import resolve_identifier
from apps.accounts.models import (
    VerificationCode,
    VerificationCodeChannel,
    VerificationCodePurpose,
)
from apps.accounts.serializers import (
    ForgotPasswordSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    VerifySerializer,
    LoginSerializer,
)
from django.contrib.auth import get_user_model
from apps.accounts.otp import send_otp

def _tokens_for(user):
    """Issue a JWT access/refresh pair for a user."""
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": _tokens_for(user),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class VerifyAccountView(generics.GenericAPIView):
    """
    Submit the 6-digit OTP for the currently authenticated user.
    On success, sets is_verified=True and returns the updated user.
    """

    serializer_class = VerifySerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if user.is_verified:
            return Response(
                {
                    "detail": "Account is already verified.",
                    "reason": "already_verified",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        code = (
            VerificationCode.objects.filter(
                user=user,
                purpose=VerificationCodePurpose.ACCOUNT_VERIFY,
                used_at__isnull=True,
            )
            .order_by("-created_at")
            .first()
        )

        if code is None:
            return Response(
                {"detail": "No verification code found. Request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ok, reason = code.check_and_consume(serializer.validated_data["code"])

        if not ok:
            message = {
                "wrong_code": "That code is incorrect.",
                "expired": "That code has expired. Request a new one.",
                "used": "That code has already been used. Request a new one.",
                "too_many_attempts": "Too many attempts. Request a new code.",
            }.get(reason, "Invalid code.")
            return Response(
                {"detail": message, "reason": reason},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_verified = True
        user.save(update_fields=["is_verified"])

        return Response(
            {
                "detail": "Account verified.",
                "user": UserSerializer(user).data,
            }
        )


class ForgotPasswordView(generics.GenericAPIView):
    """
    Send a password-reset OTP if the identifier matches an account.
    Always returns 200 with the same body — no account enumeration.
    """

    serializer_class = ForgotPasswordSerializer
    permission_classes = [permissions.AllowAny]

    _NEUTRAL_RESPONSE = {
        "detail": "If an account matches, we've sent reset instructions."
    }

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = resolve_identifier(serializer.validated_data["email_or_phone"])

        if user is not None and user.is_active:
            # Choose the channel based on what the user has.
            channel = (
                VerificationCodeChannel.SMS
                if user.phone_number
                else VerificationCodeChannel.EMAIL
            )
            code, raw = VerificationCode.issue(
                user=user,
                purpose=VerificationCodePurpose.PASSWORD_RESET,
                channel=channel,
            )
            send_otp(user, raw, channel=code.channel, purpose=code.purpose)

        return Response(self._NEUTRAL_RESPONSE)


class ResetPasswordView(generics.GenericAPIView):
    """
    Verify a PASSWORD_RESET code and set a new password.
    """

    serializer_class = ResetPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = resolve_identifier(serializer.validated_data["email_or_phone"])

        # Same response for "no such user" and "wrong code" — no enumeration,
        # and no confirmation that the identifier is valid.
        _GENERIC_FAIL = {
            "detail": "That code is incorrect or has expired. Request a new one.",
            "reason": "invalid_or_expired",
        }

        if user is None:
            return Response(_GENERIC_FAIL, status=status.HTTP_400_BAD_REQUEST)

        code = (
            VerificationCode.objects.filter(
                user=user,
                purpose=VerificationCodePurpose.PASSWORD_RESET,
                used_at__isnull=True,
            )
            .order_by("-created_at")
            .first()
        )
        if code is None:
            return Response(_GENERIC_FAIL, status=status.HTTP_400_BAD_REQUEST)

        ok, _reason = code.check_and_consume(serializer.validated_data["code"])
        if not ok:
            return Response(_GENERIC_FAIL, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response({"detail": "Password updated."})


class LoginView(generics.GenericAPIView):
    """
    POST /api/v1/auth/login/
    Body: {"email_or_phone": "...", "password": "..."}
    Returns: {"user": {...}, "tokens": {"access": "...", "refresh": "..."}}
    """

    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class ResendVerificationView(generics.GenericAPIView):
    """
    Issue a fresh ACCOUNT_VERIFY code for the authenticated user.
    Invalidates any previous unused code (VerificationCode.issue handles it).
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if user.is_verified:
            return Response(
                {
                    "detail": "Account is already verified.",
                    "reason": "already_verified",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        channel = (
            VerificationCodeChannel.SMS
            if user.phone_number
            else VerificationCodeChannel.EMAIL
        )
        code, raw = VerificationCode.issue(
            user=user,
            purpose=VerificationCodePurpose.ACCOUNT_VERIFY,
            channel=channel,
        )
        send_otp(user, raw, channel=code.channel, purpose=code.purpose)
        return Response({"detail": "A new code has been sent."})
