from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer
from core.permissions import IsAdminOrReadOnly


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=["get"])
    def active(self, request):
        now = timezone.now()
        notification = Notification.objects.filter(
            is_active=True,
            start_date__lte=now,
        ).filter(
            models.Q(end_date__gte=now) | models.Q(end_date__isnull=True)
        ).order_by("-created_at").first()

        if notification:
            return Response(NotificationSerializer(notification).data)
        return Response({"notification": None})
