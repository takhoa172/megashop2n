from rest_framework import viewsets
from django.db import transaction
from apps.products.models import Product
from .models import Sale
from .serializers import SaleSerializer
from core.permissions import IsStaffOrHigher


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related("product", "sold_by").all()
    serializer_class = SaleSerializer
    permission_classes = [IsStaffOrHigher]

    def perform_create(self, serializer):
        with transaction.atomic():
            product_id = serializer.validated_data["product"].pk
            product = Product.objects.select_for_update().get(pk=product_id)
            if product.status == "sold":
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Product is already sold")
            sale = serializer.save(sold_by=self.request.user)
            product.status = "sold"
            product.sale_price = sale.sale_price
            product.save()
