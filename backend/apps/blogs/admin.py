from django.contrib import admin
from django.utils.html import format_html
from .models import BlogPost, BlogCategory
from apps.common.admin_mixins import cloudinary_image_admin


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(BlogPost)
class BlogPostAdmin(cloudinary_image_admin(url_field="featured_image", public_id_field="featured_image_public_id", folder="blogs")):
    list_display = ["title", "image_preview", "status", "category", "author", "published_at"]
    list_filter = ["status", "category"]
    search_fields = ["title", "content"]
    readonly_fields = ["featured_image", "featured_image_public_id"]

    def image_preview(self, obj):
        if obj.featured_image:
            return format_html(f'<img src="{obj.featured_image}" style="width:80px;height:50px;object-fit:cover;border-radius:4px" />')
        return "-"
    image_preview.short_description = "Ảnh"
