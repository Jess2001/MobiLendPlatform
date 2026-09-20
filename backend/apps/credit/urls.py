from django.urls import path
from .views import LoanProductView

urlpatterns =[
    path("loan-products/", LoanProductView.as_view(), name="loan-products-list")
]