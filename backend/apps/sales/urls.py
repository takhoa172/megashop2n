from django.urls import path
from .views import SaleViewSet

list_view = SaleViewSet.as_view({"get": "list", "post": "create"})
detail_view = SaleViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    path("", list_view, name="sales-list"),
    path("<uuid:pk>", detail_view, name="sales-detail"),
]
