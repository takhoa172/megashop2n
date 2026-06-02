from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from django.db.models import Count
from .models import ProductView


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def most_viewed(request):
    top_products = (
        Product.objects
        .annotate(view_count=Count("views"))
        .filter(view_count__gt=0)
        .order_by("-view_count")[:10]
    )
    serializer = ProductSerializer(top_products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def suggested(request):
    products = Product.objects.filter(is_suggested=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def price_zero(request):
    products = Product.objects.filter(sale_price=0)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
