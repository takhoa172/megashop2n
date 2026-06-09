from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product_name", "product_image", "quantity", "unit_price", "subtotal"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "total", "payment_method", "payment_status", "created_at"]
    list_filter = ["status", "payment_method", "payment_status"]
    search_fields = ["shipping_name", "shipping_phone", "guest_email"]
    inlines = [OrderItemInline]
    readonly_fields = ["subtotal", "shipping_fee", "total", "created_at", "updated_at"]
