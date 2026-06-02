from rest_framework import serializers
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image_url", "public_id", "is_primary", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "sku", "category", "category_name", "name", "description",
            "purchase_price", "sale_price", "status", "quantity", "is_suggested", "notes",
            "created_by", "created_by_name", "images", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "sku", "created_by", "created_at", "updated_at"]

    def validate_purchase_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Purchase price must be >= 0")
        return value

    def validate_sale_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Sale price must be >= 0")
        return value


class ProductCreateSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "sku", "category", "name", "description",
            "purchase_price", "sale_price", "status", "quantity", "notes",
            "images", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "sku", "created_at", "updated_at"]

    def validate_purchase_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Purchase price must be >= 0")
        return value
