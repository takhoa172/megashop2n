from django.contrib import admin
from django.utils.html import format_html
from .models import ProductView


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ["product_name", "ip_address", "viewed_at"]
    list_select_related = ["product"]
    search_fields = ["product__name", "ip_address"]
    list_filter = ["product", "viewed_at"]
    date_hierarchy = "viewed_at"
    autocomplete_fields = ["product"]

    def product_name(self, obj):
        url = f"/admin/products/product/{obj.product_id}/change/"
        return format_html(f'<a href="{url}">{obj.product.name}</a>')
    product_name.short_description = "Sản phẩm"
    product_name.admin_order_field = "product__name"
