from django.urls import path
from .views import BlogPostViewSet, BlogCategoryViewSet

post_list = BlogPostViewSet.as_view({"get": "list", "post": "create"})
post_detail = BlogPostViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
cat_list = BlogCategoryViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = [
    path("", post_list, name="blogs-list"),
    path("<slug:slug>", post_detail, name="blogs-detail"),
    path("<uuid:pk>", post_detail, name="blogs-detail-pk"),
    path("categories", cat_list, name="blog-categories"),
]
