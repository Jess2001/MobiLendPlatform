from django.shortcuts import render
from rest_framework import viewsets,generics,status
from apps.accounts.permissions import IsVerifiedUser
from .models import LoanProduct, LoanProductTerm
from .serializers import LoanProductSerializer, LoanProductTermSerializer
from rest_framework.response import Response
from django.db.models import Prefetch
# Create your views here.

class LoanProductView(generics.ListAPIView):
    serializer_class = LoanProductSerializer
    permission_classes = [IsVerifiedUser]
    def get_queryset(self):
        return  LoanProduct.objects.filter(active=True).prefetch_related(
                    Prefetch("terms",queryset=LoanProductTerm.objects.filter(active=True).order_by("term_in_months")))
