from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomerProfile

User = get_user_model()


class CustomerMeAPITests(APITestCase):
    url = "/api/v1/customers/me/"

    def setUp(self):
        self.user = User.objects.create_user(
            email="amina@example.com", password="pw12345678", phone_number="+254712345678"
        )
        self.profile = CustomerProfile.objects.create(
            user=self.user, first_name="Amina", last_name="Njeri",
            phone_number="+254712345678", national_id="12345678",
            monthly_income=80000, monthly_expenses=35000,
        )

    def test_requires_authentication(self):
        self.assertEqual(self.client.get(self.url).status_code,
                         status.HTTP_401_UNAUTHORIZED)

    def test_returns_own_profile(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["customer_number"],
                         self.profile.customer_number)

    def test_does_not_leak_sensitive_fields(self):
        """Doc §3.2 — least privilege."""
        self.client.force_authenticate(self.user)
        data = self.client.get(self.url).data
        for field in ("national_id", "monthly_income", "monthly_expenses",
                      "date_of_birth"):
            self.assertNotIn(field, data)

    def test_customer_number_is_generated_and_unique(self):
        other = User.objects.create_user(email="b@example.com", password="pw12345678")
        p2 = CustomerProfile.objects.create(user=other, first_name="B", last_name="O",
                                            phone_number="+254700000001")
        self.assertNotEqual(self.profile.customer_number, p2.customer_number)
        self.assertEqual(p2.customer_number, f"CUS-{p2.created_at.year}-00002")