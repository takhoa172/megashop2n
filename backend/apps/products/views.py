from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductCreateSerializer, ProductImageSerializer
from .filters import ProductFilter
from .cloudinary_utils import upload_to_cloudinary, delete_from_cloudinary
from core.permissions import IsStaffOrHigher
from django_filters.rest_framework import DjangoFilterBackend
from apps.product_views.models import ProductView


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "created_by").prefetch_related("images")
    permission_classes = [IsStaffOrHigher]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [p() for p in self.permission_classes]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        return ProductSerializer

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        product = self.get_object()
        ip = request.META.get("REMOTE_ADDR", "")
        ProductView.objects.create(product=product, ip_address=ip)
        return response

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        product = self.get_object()
        if product.status == "sold":
            restricted_fields = ["purchase_price"]
            for field in restricted_fields:
                if field in serializer.validated_data:
                    serializer.validated_data.pop(field)
        serializer.save()

    @action(detail=True, methods=["post"])
    def upload_image(self, request, id=None):
        product = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"message": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = upload_to_cloudinary(file)
            is_primary = request.data.get("is_primary", "false").lower() == "true"
            if is_primary:
                ProductImage.objects.filter(product=product, is_primary=True).update(
                    is_primary=False
                )
            image = ProductImage.objects.create(
                product=product,
                image_url=result["url"],
                public_id=result["public_id"],
                is_primary=is_primary,
            )
            return Response(
                ProductImageSerializer(image).data, status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["delete"])
    def remove_image(self, request, id=None):
        product = self.get_object()
        image_id = request.data.get("image_id")
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            delete_from_cloudinary(image.public_id)
            image.delete()
            return Response({"message": "Image removed"}, status=status.HTTP_200_OK)
        except ProductImage.DoesNotExist:
            return Response(
                {"message": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )
