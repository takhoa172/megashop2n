from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "product_count", "created_at"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ["created_at"]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_product_count=Count("products"))

    def product_count(self, obj):
        count = getattr(obj, "_product_count", 0)
        url = f"/admin/products/product/?category__id__exact={obj.id}"
        return format_html(f'<a href="{url}">{count}</a>')
    product_count.short_description = "Số SP"
    product_count.admin_order_field = "_product_count"
