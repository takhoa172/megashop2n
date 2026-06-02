from rest_framework import serializers
from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    sold_by_name = serializers.CharField(source="sold_by.full_name", read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id", "product", "product_name", "sale_price", "sold_at",
            "sold_by", "sold_by_name", "customer_name", "note", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_sale_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Sale price must be >= 0")
        return value

    def validate_product(self, value):
        if value.status == "sold":
            raise serializers.ValidationError("Product is already sold")
        return value
