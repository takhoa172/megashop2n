from django.contrib import admin
from django.utils.html import format_html
from .models import Product, ProductImage
from apps.common.admin_mixins import cloudinary_image_admin


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ["image_preview"]

    def image_preview(self, obj):
        if obj.pk and obj.image_url:
            return format_html(f'<img src="{obj.image_url}" style="width:80px;height:50px;object-fit:cover;border-radius:4px" />')
        return "-"
    image_preview.short_description = "Ảnh"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ["name", "sku", "category", "status", "purchase_price", "sale_price", "quantity", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["name", "sku"]
    list_select_related = ["category"]


@admin.register(ProductImage)
class ProductImageAdmin(cloudinary_image_admin(url_field="image_url", public_id_field="public_id", folder="products")):
    list_display = ["product", "image_preview", "is_primary"]
    list_filter = ["is_primary", "product__category"]
    search_fields = ["product__name"]
    list_select_related = ["product"]
    autocomplete_fields = ["product"]

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(f'<img src="{obj.image_url}" style="width:80px;height:50px;object-fit:cover;border-radius:4px" />')
        return "-"
    image_preview.short_description = "Ảnh"
