from rest_framework import viewsets
from .models import Sale
from .serializers import SaleSerializer
from core.permissions import IsStaffOrHigher


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related("product", "sold_by").all()
    serializer_class = SaleSerializer
    permission_classes = [IsStaffOrHigher]

    def perform_create(self, serializer):
        sale = serializer.save(sold_by=self.request.user)
        product = sale.product
        product.status = "sold"
        product.sale_price = sale.sale_price
        product.save()
