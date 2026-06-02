import uuid
from django.db import models


class Slider(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True, null=True)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True)
    image_public_id = models.CharField(max_length=255, blank=True, null=True)
    link_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sliders"
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.title or f"Slider {self.id}"
