from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from django.db.models import Count, Q as models_Q
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


@api_view(["GET"])
@permission_classes([AllowAny])
def related(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Sản phẩm không tồn tại"}, status=404)
    related_products = (
        Product.objects
        .select_related("category", "created_by")
        .prefetch_related("images")
        .filter(category=product.category, is_visible=True)
        .exclude(pk=product.pk)
        .order_by("?")[:8]
    )
    serializer = ProductSerializer(related_products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def for_you(request):
    user = request.user
    ip = request.META.get("REMOTE_ADDR", "")

    if user.is_authenticated and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]:
        products = (
            Product.objects
            .select_related("category", "created_by")
            .prefetch_related("images")
            .filter(is_suggested=True, is_visible=True)[:8]
        )
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    viewed = ProductView.objects.filter(ip_address=ip, product__isnull=False)

    from django.db.models import Count
    top_categories = (
        viewed.exclude(product__category=None)
        .values("product__category")
        .annotate(c=Count("id"))
        .order_by("-c")[:3]
    )
    cat_ids = [row["product__category"] for row in top_categories]

    if not cat_ids:
        products = (
            Product.objects
            .filter(is_suggested=True, is_visible=True)[:8]
        )
    else:
        products = (
            Product.objects
            .select_related("category", "created_by")
            .prefetch_related("images")
            .filter(category_id__in=cat_ids, is_visible=True)
            .order_by("?")[:8]
        )
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def suggest(request):
    q = request.query_params.get("q", "").strip()
    if not q:
        return Response([])
    products = (
        Product.objects
        .filter(is_visible=True)
        .filter(
            models_Q(name__icontains=q) | models_Q(sku__icontains=q)
        )[:10]
    )
    return Response([
        {"id": str(p.id), "name": p.name, "sale_price": str(p.sale_price or 0), "image": (p.images.filter(is_primary=True).first().image_url if p.images.exists() else "")}
        for p in products
    ])
