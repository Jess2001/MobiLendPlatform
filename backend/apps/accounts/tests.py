from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_defaults(self):
        user = User.objects.create_user(email="a@example.com", password="pw12345678")
        self.assertEqual(user.role, Role.CUSTOMER)
        self.assertFalse(user.is_staff)
        self.assertTrue(user.check_password("pw12345678"))
        self.assertNotEqual(user.password, "pw12345678")   # never plaintext

    def test_create_superuser(self):
        user = User.objects.create_superuser(email="root@example.com", password="pw12345678")
        self.assertEqual(user.role, Role.SUPERADMIN)
        self.assertTrue(user.is_staff and user.is_superuser)

    def test_email_is_unique_at_db_level(self):
        User.objects.create_user(email="a@example.com", password="pw12345678")
        with self.assertRaises(IntegrityError), transaction.atomic():
            User.objects.create_user(email="a@example.com", password="pw12345678")


class RegistrationAPITests(APITestCase):
    url = "/api/v1/auth/register/"

    def _payload(self, **overrides):
        data = {
            "email": "amina@example.com",
            "password": "Str0ngPass!23",
            "phone_number": "+254712345678",
            "first_name": "Amina",
            "last_name": "Njeri",
        }
        data.update(overrides)
        return data

    def test_register_creates_user_and_profile(self):
        response = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="amina@example.com")
        self.assertEqual(user.role, Role.CUSTOMER)
        self.assertTrue(user.customer_profile.customer_number.startswith("CUS-"))

    def test_duplicate_email_rejected(self):
        self.client.post(self.url, self._payload(), format="json")
        response = self.client.post(self.url, self._payload(phone_number="+254700000000"),
                                    format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_role_cannot_be_escalated_via_registration(self):
        """The single most important security test on this endpoint."""
        payload = self._payload()
        payload["role"] = "SUPERADMIN"
        self.client.post(self.url, payload, format="json")
        self.assertEqual(User.objects.get(email="amina@example.com").role,
                         Role.CUSTOMER)

    def test_profile_failure_rolls_back_user_creation(self):
        """Atomicity: no orphaned User without a CustomerProfile."""
        from unittest.mock import patch
        with patch("apps.accounts.serializers.CustomerProfile.objects.create",
                   side_effect=RuntimeError("boom")):
            with self.assertRaises(RuntimeError):
                self.client.post(self.url, self._payload(), format="json")
        self.assertFalse(User.objects.filter(email="amina@example.com").exists())