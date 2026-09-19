from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

    def ready(self):
        # Import side-effect: registers the JWT OpenAPI auth scheme with drf-spectacular.
        from . import schema  # noqa: F401
