from django.urls import path
from .views import NotificationViewSet

list_view = NotificationViewSet.as_view({"get": "list", "post": "create"})
detail_view = NotificationViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
active_view = NotificationViewSet.as_view({"get": "active"})

urlpatterns = [
    path("", list_view, name="notifications-list"),
    path("active", active_view, name="notifications-active"),
    path("<uuid:pk>", detail_view, name="notifications-detail"),
]
