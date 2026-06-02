from rest_framework import serializers
from .models import ProductView


class ProductViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductView
        fields = ["id", "product", "ip_address", "viewed_at"]
        read_only_fields = ["id", "viewed_at"]
