from django.urls import path
from .views import BlogPostViewSet, BlogCategoryViewSet

post_list = BlogPostViewSet.as_view({"get": "list", "post": "create"})
post_detail = BlogPostViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
post_upload_image = BlogPostViewSet.as_view({"post": "upload_image"})
cat_list = BlogCategoryViewSet.as_view({"get": "list", "post": "create"})
cat_detail = BlogCategoryViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("", post_list, name="blogs-list"),
    path("categories/", cat_list, name="blog-categories"),
    path("categories/<uuid:pk>/", cat_detail, name="blog-category-detail"),
    path("<slug:slug>/", post_detail, name="blogs-detail"),
    path("<slug:slug>/upload-image", post_upload_image, name="blogs-upload-image"),
]
