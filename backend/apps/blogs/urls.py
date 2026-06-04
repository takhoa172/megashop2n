from django.urls import path
from .views import BlogPostViewSet, BlogCategoryViewSet

post_list = BlogPostViewSet.as_view({"get": "list", "post": "create"})
post_detail = BlogPostViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
cat_list = BlogCategoryViewSet.as_view({"get": "list", "post": "create"})
cat_detail = BlogCategoryViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("", post_list, name="blogs-list"),
    path("<slug:slug>", post_detail, name="blogs-detail"),
    path("categories", cat_list, name="blog-categories"),
    path("categories/<uuid:pk>", cat_detail, name="blog-category-detail"),
]
