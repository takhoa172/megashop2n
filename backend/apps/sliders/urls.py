from django.urls import path
from .views import SliderViewSet

list_view = SliderViewSet.as_view({"get": "list", "post": "create"})
detail_view = SliderViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
upload_image_view = SliderViewSet.as_view({"post": "upload_image"})

urlpatterns = [
    path("", list_view, name="sliders-list"),
    path("<uuid:pk>/", detail_view, name="sliders-detail"),
    path("<uuid:pk>/upload-image/", upload_image_view, name="sliders-upload-image"),
]
