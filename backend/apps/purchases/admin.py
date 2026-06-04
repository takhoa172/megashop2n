from django.contrib import admin
from .models import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ["product", "payer", "purchase_price", "purchased_at"]
    list_select_related = ["product", "payer"]
    search_fields = ["product__name", "payer__email", "note"]
    list_filter = ["product", "payer", "purchased_at"]
    date_hierarchy = "purchased_at"
    autocomplete_fields = ["product", "payer"]
