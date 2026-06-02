from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "is_active", "start_date", "end_date"]
    list_filter = ["is_active"]
