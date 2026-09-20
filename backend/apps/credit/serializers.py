from .models import LoanProduct, LoanProductTerm
from rest_framework import serializers


class LoanProductTermSerializer(serializers.ModelSerializer):
    class Meta:
        model=LoanProductTerm
        fields = [ "term_in_months", "annual_interest_rate"]

class LoanProductSerializer(serializers.ModelSerializer):
    terms = LoanProductTermSerializer(many=True, read_only=True)

    class Meta:
        model = LoanProduct
        fields = [ "code", "name", "description", "minimum_amount", "maximum_amount", "processing_fee_rate", "repayment_frequency", "terms"]