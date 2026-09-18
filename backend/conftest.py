import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """A DRF APIClient for making requests in tests."""
    return APIClient()
