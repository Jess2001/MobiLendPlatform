from drf_spectacular.utils import inline_serializer
from rest_framework import serializers

# ---- Reusable inline serializers ----
# These exist only for OpenAPI documentation. They never validate at runtime.

TokenPair = inline_serializer(
    name="TokenPair",
    fields={
        "access": serializers.CharField(),
        "refresh": serializers.CharField(),
    },
)

ErrorResponse = inline_serializer(
    name="ErrorResponse",
    fields={
        "detail": serializers.CharField(),
        "reason": serializers.CharField(required=False),
        "retry_after_seconds": serializers.IntegerField(required=False),
    },
)

ValidationErrorResponse = inline_serializer(
    name="ValidationErrorResponse",
    fields={
        "non_field_errors": serializers.ListField(
            child=serializers.CharField(), required=False
        ),
    },
)
