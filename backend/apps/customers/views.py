
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from .models import CustomerProfile
from .serializers import CustomerProfileSelfSerializer


class CustomerMeView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerProfileSelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(CustomerProfile, user=self.request.user)