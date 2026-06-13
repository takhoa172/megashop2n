import uuid
from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BlogPost, BlogCategory
from .serializers import (
    BlogPostSerializer,
    BlogPostCreateSerializer,
    BlogCategorySerializer,
)
from core.permissions import IsAdminOrReadOnly
from apps.products.cloudinary_utils import upload_to_cloudinary


class BlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        show_hidden = self.request.query_params.get("show_hidden") == "1"
        if self.action in ["list", "retrieve"] and not show_hidden:
            if not (user.is_authenticated and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]):
                qs = qs.filter(is_visible=True)
        return qs


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
        lookup = self.kwargs.get("slug")
        if lookup:
            try:
                uuid.UUID(str(lookup))
                return get_object_or_404(queryset, pk=lookup)
            except (ValueError, AttributeError):
                return get_object_or_404(queryset, slug=lookup)
        return super().get_object()

    def get_queryset(self):
        from django.utils import timezone
        qs = super().get_queryset()
        user = self.request.user
        show_hidden = self.request.query_params.get("show_hidden") == "1"
        status = self.request.query_params.get("status")
        category = self.request.query_params.get("category")
        if self.action in ["list", "retrieve"] and not show_hidden:
            if not (user.is_authenticated and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]):
                now = timezone.now()
                qs = qs.filter(
                    is_visible=True,
                    status="published",
                ).filter(
                    models.Q(published_at__isnull=True) | models.Q(published_at__lte=now)
                )
        if status:
            qs = qs.filter(status=status)
        if category:
            qs = qs.filter(category_id=category)
        return qs

    @action(detail=True, methods=["post"])
    def upload_image(self, request, slug=None):
        post = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"message": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = upload_to_cloudinary(file)
            post.featured_image = result["url"]
            post.featured_image_public_id = result["public_id"]
            post.save(update_fields=["featured_image", "featured_image_public_id"])
            return Response(
                {"url": result["url"], "public_id": result["public_id"]},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
