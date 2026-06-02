from django.urls import path
from .views import PurchaseViewSet

list_view = PurchaseViewSet.as_view({"get": "list", "post": "create"})
detail_view = PurchaseViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    path("", list_view, name="purchases-list"),
    path("<uuid:pk>", detail_view, name="purchases-detail"),
]
