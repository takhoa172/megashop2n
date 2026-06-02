from django.urls import path
from .views import ProductViewSet

list_view = ProductViewSet.as_view({"get": "list", "post": "create"})
detail_view = ProductViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
upload_image = ProductViewSet.as_view({"post": "upload_image"})
remove_image = ProductViewSet.as_view({"delete": "remove_image"})

urlpatterns = [
    path("", list_view, name="products-list"),
    path("<uuid:id>", detail_view, name="products-detail"),
    path("<uuid:id>/upload-image", upload_image, name="products-upload-image"),
    path("<uuid:id>/remove-image", remove_image, name="products-remove-image"),
]
