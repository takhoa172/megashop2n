from django.urls import path
from .views import ProductViewSet

list_view = ProductViewSet.as_view({"get": "list", "post": "create"})
detail_view = ProductViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
upload_image = ProductViewSet.as_view({"post": "upload_image"})
add_image_url = ProductViewSet.as_view({"post": "add_image_url"})
remove_image = ProductViewSet.as_view({"post": "remove_image"})
replace_image = ProductViewSet.as_view({"post": "replace_image"})
set_primary_image = ProductViewSet.as_view({"post": "set_primary_image"})

urlpatterns = [
    path("", list_view, name="products-list"),
    path("<uuid:id>/", detail_view, name="products-detail"),
    path("<uuid:id>/upload-image", upload_image, name="products-upload-image"),
    path("<uuid:id>/add-image-url", add_image_url, name="products-add-image-url"),
    path("<uuid:id>/remove-image", remove_image, name="products-remove-image"),
    path("<uuid:id>/replace-image", replace_image, name="products-replace-image"),
    path("<uuid:id>/set-primary-image", set_primary_image, name="products-set-primary-image"),
]
