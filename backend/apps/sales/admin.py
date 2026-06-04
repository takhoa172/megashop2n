from django.contrib import admin
from .models import Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ["product", "sale_price", "customer_name", "sold_by", "sold_at"]
    list_select_related = ["product", "sold_by"]
    search_fields = ["product__name", "customer_name", "note"]
    list_filter = ["product", "sold_by", "sold_at"]
    date_hierarchy = "sold_at"
    autocomplete_fields = ["product", "sold_by"]
