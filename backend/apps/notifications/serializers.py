from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "is_active", "start_date", "end_date", "created_at"]
        read_only_fields = ["id", "created_at"]
