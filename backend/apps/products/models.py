import uuid
from django.db import models
from apps.categories.models import Category
from apps.users.models import User


class Product(models.Model):
    class Status(models.TextChoices):
        PENDING_PRICE = "pending_price", "Pending Price"
        IN_STOCK = "in_stock", "In Stock"
        SOLD = "sold", "Sold"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="products"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    sale_price = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True,
        help_text="null = chưa set, 0 = thanh lý miễn phí, >0 = giá bán"
    )
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING_PRICE
    )
    quantity = models.IntegerField(default=1)
    is_suggested = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_products"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image_url = models.URLField(max_length=500)
    public_id = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_images"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "is_primary"],
                condition=models.Q(is_primary=True),
                name="unique_primary_image_per_product",
            )
        ]

    def __str__(self):
        return f"Image for {self.product.name}"
