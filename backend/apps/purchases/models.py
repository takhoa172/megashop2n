import uuid
from django.db import models
from apps.products.models import Product
from apps.users.models import User


class Purchase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="purchases"
    )
    payer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="purchases_paid"
    )
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    purchased_at = models.DateTimeField()
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "purchases"
        ordering = ["-purchased_at"]

    def __str__(self):
        return f"Purchase of {self.product.name} - {self.purchase_price}"
