from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id", "product", "product_name", "product_image",
            "quantity", "unit_price", "subtotal",
        ]
        read_only_fields = ["id", "product_name", "product_image", "subtotal"]


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True, default="")
    user_email = serializers.EmailField(source="user.email", read_only=True, default="")

    class Meta:
        model = Order
        fields = [
            "id", "user", "user_name", "user_email", "guest_email",
            "status", "subtotal", "shipping_fee", "total",
            "shipping_name", "shipping_phone", "shipping_address",
            "note", "payment_method", "payment_status",
            "vnpay_txn_ref", "vnpay_paid_at",
            "items", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "user", "status", "subtotal", "total",
            "payment_status", "vnpay_txn_ref", "vnpay_paid_at",
            "created_at", "updated_at",
        ]


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemCreateSerializer(many=True)
    shipping_name = serializers.CharField(max_length=255)
    shipping_phone = serializers.CharField(max_length=20)
    shipping_address = serializers.CharField()
    note = serializers.CharField(required=False, allow_blank=True, default="")
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD
    )
    guest_email = serializers.EmailField(required=False, allow_null=True, default=None)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Must have at least one item")
        product_ids = [item["product_id"] for item in items]
        products = Product.objects.filter(id__in=product_ids)
        if len(products) != len(set(product_ids)):
            raise serializers.ValidationError("Some products not found")
        for product in products:
            if product.status != "in_stock":
                raise serializers.ValidationError(
                    f"Product {product.name} is not available"
                )
        return items

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user
        is_customer = user.is_authenticated and hasattr(user, "role") and user.role == "CUSTOMER"

        subtotal = 0
        order_items_data = []

        for item_data in items_data:
            product = Product.objects.get(id=item_data["product_id"])
            unit_price = product.sale_price if product.sale_price is not None else 0
            item_subtotal = unit_price * item_data["quantity"]
            subtotal += item_subtotal
            primary_image = product.images.filter(is_primary=True).first()
            order_items_data.append({
                "product": product,
                "product_name": product.name,
                "product_image": primary_image.image_url if primary_image else "",
                "quantity": item_data["quantity"],
                "unit_price": unit_price,
                "subtotal": item_subtotal,
            })

        guest_email = validated_data.pop("guest_email", None) if "guest_email" in validated_data else None
        shipping_fee = validated_data.pop("shipping_fee", 0) if "shipping_fee" in validated_data else (
            30000 if subtotal < 500000 else 0
        )
        total = subtotal + shipping_fee

        order = Order.objects.create(
            user=user if is_customer else None,
            guest_email=guest_email,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total=total,
            **validated_data,
        )

        for item in order_items_data:
            OrderItem.objects.create(order=order, **item)

        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]
