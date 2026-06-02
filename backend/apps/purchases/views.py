from rest_framework import viewsets
from .models import Purchase
from .serializers import PurchaseSerializer
from core.permissions import IsStaffOrHigher


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.select_related("product", "payer").all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsStaffOrHigher]

    def perform_create(self, serializer):
        purchase = serializer.save()
        product = purchase.product
        product.purchase_price = purchase.purchase_price
        if product.status == "pending_price":
            product.status = "in_stock"
        product.save()
