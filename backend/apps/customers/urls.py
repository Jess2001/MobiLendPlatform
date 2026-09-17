from django.urls import path
from .views import CustomerMeView

urlpatterns = [path("me/", CustomerMeView.as_view(), name="customer-me")]
# config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/customers/", include("apps.customers.urls")),
]