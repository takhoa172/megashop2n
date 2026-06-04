from rest_framework import viewsets, serializers as drf_serializers
from .models import Purchase
from .serializers import PurchaseSerializer
from core.permissions import IsStaffOrHigher


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.select_related("product", "payer").all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsStaffOrHigher]

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        if product.status == "sold":
            raise drf_serializers.ValidationError("Cannot purchase a sold product")
        if product.status == "in_stock":
            raise drf_serializers.ValidationError("Product already has purchase price set")
        purchase = serializer.save()
        product.refresh_from_db()
        product.purchase_price = purchase.purchase_price
        if product.status == "pending_price":
            product.status = "in_stock"
        product.save()
