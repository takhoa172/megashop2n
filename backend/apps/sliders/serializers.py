from rest_framework import serializers
from .models import Slider


class SliderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slider
        fields = [
            "id", "title", "subtitle", "image_url", "image_public_id",
            "link_url", "is_active", "sort_order", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
