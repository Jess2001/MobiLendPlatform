from rest_framework.exceptions import Throttled
from rest_framework.views import exception_handler as drf_handler


def mobilend_exception_handler(exc, context):
    """
    Wrap DRF's default exception response into a consistent shape.

    Currently handles only Throttled, so 429s return the same
    {"detail", "reason"} contract every other auth error uses.
    Additional exception types get handled here as the project grows.
    """
    response = drf_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, Throttled):
        wait = int(exc.wait) if exc.wait else None
        response.data = {
            "detail": "Too many attempts. Please try again later.",
            "reason": "too_many_attempts",
            "retry_after_seconds": wait,
        }
    return response
