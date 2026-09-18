import re

from django.core.exceptions import ValidationError


class ComplexityValidator:
    """
    Requires at least one uppercase letter, one lowercase letter, and one digit.
    Length and common-password checks are handled by Django's built-in validators.
    """

    UPPER = re.compile(r"[A-Z]")
    LOWER = re.compile(r"[a-z]")
    DIGIT = re.compile(r"\d")

    def validate(self, password, user=None):
        missing = []
        if not self.UPPER.search(password):
            missing.append("an uppercase letter")
        if not self.LOWER.search(password):
            missing.append("a lowercase letter")
        if not self.DIGIT.search(password):
            missing.append("a number")
        if missing:
            raise ValidationError(
                f"Password must contain at least {', '.join(missing)}.",
                code="password_too_simple",
            )

    def get_help_text(self):
        return (
            "Your password must contain at least one uppercase letter, "
            "one lowercase letter, and one number."
        )
