from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from django.db.models import Count
from .models import ProductView


@method_decorator(cache_page(300), name="dispatch")
@api_view(["GET"])
@permission_classes([AllowAny])
def most_viewed(request):
    top_products = (
        Product.objects
        .select_related("category", "created_by")
        .prefetch_related("images")
        .annotate(view_count=Count("views"))
        .filter(view_count__gt=0, is_visible=True)
        .order_by("-view_count")[:10]
    )
    serializer = ProductSerializer(top_products, many=True)
    return Response(serializer.data)


@method_decorator(cache_page(300), name="dispatch")
@api_view(["GET"])
@permission_classes([AllowAny])
def suggested(request):
    products = (
        Product.objects
        .select_related("category", "created_by")
        .prefetch_related("images")
        .filter(is_suggested=True, is_visible=True)[:100]
    )
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@method_decorator(cache_page(300), name="dispatch")
@api_view(["GET"])
@permission_classes([AllowAny])
def price_zero(request):
    products = (
        Product.objects
        .select_related("category", "created_by")
        .prefetch_related("images")
        .filter(sale_price=0, is_visible=True)[:100]
    )
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
