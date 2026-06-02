from rest_framework import serializers
from .models import Purchase


class PurchaseSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    payer_name = serializers.CharField(source="payer.full_name", read_only=True)

    class Meta:
        model = Purchase
        fields = [
            "id", "product", "product_name", "payer", "payer_name",
            "purchase_price", "purchased_at", "note", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_purchase_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Purchase price must be >= 0")
        return value
