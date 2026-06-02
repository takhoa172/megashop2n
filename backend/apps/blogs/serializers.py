from rest_framework import serializers
from .models import BlogPost, BlogCategory


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class BlogPostSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    author_name = serializers.CharField(source="author.full_name", read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "category", "category_name",
            "content", "excerpt", "featured_image", "featured_image_public_id",
            "author", "author_name", "status", "published_at",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "author", "created_at", "updated_at"]


class BlogPostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            "title", "category", "content", "excerpt",
            "featured_image", "featured_image_public_id",
            "status", "published_at",
        ]
