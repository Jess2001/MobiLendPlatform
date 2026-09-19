
from drf_spectacular.utils import extend_schema_view,extend_schema

from apps.core.schemas import ErrorResponse
from .serializers import CustomerProfileSelfSerializer
from rest_framework import generics, permissions, status
from .models import CustomerProfile
from django.shortcuts import get_object_or_404
@extend_schema_view(
    get=extend_schema(
        tags=["customers"],
        summary="Get the current customer's profile",
        description=(
            "Returns a least-privilege subset: full name, customer number, "
            "phone, employment status, address. Excludes national_id, "
            "date_of_birth, monthly_income, monthly_expenses."
        ),
        responses={200: CustomerProfileSelfSerializer},
    ),
    patch=extend_schema(
        tags=["customers"],
        summary="Update the current customer's profile",
        description="Only editable contact fields are accepted. read-only fields are ignored.",
        request=CustomerProfileSelfSerializer,
        responses={200: CustomerProfileSelfSerializer},
    ),
)
class CustomerMeView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerProfileSelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(CustomerProfile, user=self.request.user)
