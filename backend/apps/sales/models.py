import uuid
from django.db import models
from apps.products.models import Product
from apps.users.models import User


class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="sales"
    )
    sale_price = models.DecimalField(max_digits=15, decimal_places=2)
    sold_at = models.DateTimeField()
    sold_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="sales_made"
    )
    customer_name = models.CharField(max_length=255)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "sales"
        ordering = ["-sold_at"]

    def __str__(self):
        return f"Sale of {self.product.name} - {self.sale_price}"
