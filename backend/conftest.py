import pytest
from django.core.cache import cache
from rest_framework.test import APIClient
from apps.accounts.factories import UserFactory

@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    """Every test starts with empty rate-limit counters."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def verified_user():
    return UserFactory(is_verified=True)


@pytest.fixture
def unverified_user():
    return UserFactory(is_verified=False)
