from django.urls import path
from .views import CategoryViewSet

list_view = CategoryViewSet.as_view({"get": "list", "post": "create"})
detail_view = CategoryViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("", list_view, name="categories-list"),
    path("<uuid:id>", detail_view, name="categories-detail"),
]
