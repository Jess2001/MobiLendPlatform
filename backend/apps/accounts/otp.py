"""
OTP delivery abstraction.

The delivery mechanism is deliberately behind a single function.
Today it prints to stdout (visible in `docker compose logs api`).
Later, the body of `send_otp` will enqueue a Celery task that calls
a real SMS or email provider — callers won't change.
"""

import logging

from apps.accounts.models import (
    VerificationCodeChannel,
    VerificationCodePurpose,
)

logger = logging.getLogger(__name__)


# Human-readable subject lines so a demo log is easy to scan.
_SUBJECTS = {
    VerificationCodePurpose.ACCOUNT_VERIFY: "Verify your MobiLend account",
    VerificationCodePurpose.PASSWORD_RESET: "Reset your MobiLend password",
}


def send_otp(user, raw_code: str, channel: str, purpose: str) -> None:
    """
    Deliver a one-time code to the user.

    `channel` is one of VerificationCodeChannel choices.
    `purpose` is one of VerificationCodePurpose choices.
    """
    subject = _SUBJECTS.get(purpose, "MobiLend verification code")

    if channel == VerificationCodeChannel.SMS:
        recipient = user.phone_number or "(no phone on file)"
    elif channel == VerificationCodeChannel.EMAIL:
        recipient = user.email
    else:
        recipient = "(unknown channel)"

    # Deliberately loud so it's easy to find in the log during development.
    logger.warning(
        "\n"
        "================= MobiLend OTP =================\n"
        "To:      %s\n"
        "Channel: %s\n"
        "Subject: %s\n"
        "Code:    %s\n"
        "================================================",
        recipient,
        channel,
        subject,
        raw_code,
    )
