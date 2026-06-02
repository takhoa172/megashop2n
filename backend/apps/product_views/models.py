import uuid
from django.db import models
from apps.products.models import Product


class ProductView(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="views"
    )
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_views"
        ordering = ["-viewed_at"]

    def __str__(self):
        return f"View of {self.product.name}"
