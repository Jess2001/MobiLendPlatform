from apps.accounts.models import User


def resolve_identifier(value: str) -> User | None:
    """
    Find a user by email (case-insensitive) or phone number.
    Returns None if no match.
    """
    value = value.strip()
    if not value:
        return None

    if "@" in value:
        return User.objects.filter(email__iexact=value).first()

    return User.objects.filter(phone_number=value).first()
