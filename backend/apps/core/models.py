from django.utils import timezone
from django.db import IntegrityError, models, transaction

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class NumberSequence(models.Model):
    key = models.CharField(max_length=32)
    year = models.PositiveIntegerField()
    last_value = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["key", "year"], name="uniq_number_sequence_key_year"
            )
        ]
    def __str__(self):
        return f"{self.key}/{self.year} -> {self.last_value}"

    @classmethod
    def next_value(cls, key: str, year: int | None = None) -> int:
        year = year or timezone.now().year
        with transaction.atomic():
            seq = cls.objects.select_for_update().filter(key=key, year=year).first()
            if seq is None:
                try:
                    # Nested atomic => the savepoint rolls back on collision
                    # without poisoning the outer transaction.
                    with transaction.atomic():
                        seq = cls.objects.create(key=key, year=year, last_value=0)
                except IntegrityError:
                    seq = cls.objects.select_for_update().get(key=key, year=year)
            seq.last_value += 1
            seq.save(update_fields=["last_value"])
            return seq.last_value