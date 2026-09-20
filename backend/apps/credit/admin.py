from django.contrib import admin
from .models import LoanProduct, LoanProductTerm
# Register your models here.

class LoanProductTermInline(admin.TabularInline):
    model = LoanProductTerm
    extra = 1


@admin.register(LoanProduct)
class LoanProductAdmin(admin.ModelAdmin):
    inlines = [LoanProductTermInline]
    list_display = ("code", "name", "minimum_amount", "maximum_amount", "processing_fee_rate", "repayment_frequency", "active")
    list_filter = ("active",)
    search_fields = ("code", "name")
   
