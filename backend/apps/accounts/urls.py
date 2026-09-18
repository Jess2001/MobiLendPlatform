from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ForgotPasswordView,
    LoginView,
    MeView,
    RegisterView,
    ResetPasswordView,
    VerifyAccountView,
    ResendVerificationView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("verify/", VerifyAccountView.as_view(), name="auth-verify"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("password/forgot/", ForgotPasswordView.as_view(), name="auth-password-forgot"),
    path("password/reset/", ResetPasswordView.as_view(), name="auth-password-reset"),
    path("verify/resend/", ResendVerificationView.as_view(), name="auth-verify-resend"),
]
