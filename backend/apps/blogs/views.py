from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import BlogPost, BlogCategory
from .serializers import (
    BlogPostSerializer,
    BlogPostCreateSerializer,
    BlogCategorySerializer,
)
from core.permissions import IsAdminOrReadOnly


class BlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.select_related("category", "author").all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content"]
    ordering_fields = ["published_at", "created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return BlogPostCreateSerializer
        return BlogPostSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        if "slug" in self.kwargs:
            return get_object_or_404(queryset, slug=self.kwargs["slug"])
        return super().get_object()

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get("status")
        category = self.request.query_params.get("category")
        if status:
            qs = qs.filter(status=status)
        if category:
            qs = qs.filter(category_id=category)
        return qs
