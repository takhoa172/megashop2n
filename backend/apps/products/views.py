from rest_framework import filters, viewsets, status
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
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ProductFilter
    ordering_fields = ["sale_price", "purchase_price", "created_at", "name"]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        return ProductSerializer

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        if not request.user.is_authenticated or request.user.role not in ["SUPER_ADMIN", "MANAGER", "STAFF"]:
            product = response.data
            ip = request.META.get("REMOTE_ADDR", "")
            ProductView.objects.create(product_id=product["id"], ip_address=ip)
        return response

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        show_hidden = self.request.query_params.get("show_hidden") == "1"
        if self.action in ["list", "retrieve"] and not show_hidden:
            if not (user.is_authenticated and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]):
                qs = qs.filter(is_visible=True)
        return qs

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

    @action(detail=True, methods=["post"])
    def add_image_url(self, request, id=None):
        try:
            product = self.get_object()
            image_url = request.data.get("image_url")
            if not image_url:
                return Response(
                    {"message": "No image_url provided"}, status=status.HTTP_400_BAD_REQUEST
                )
            raw = request.data.get("is_primary", "true")
            is_primary = str(raw).lower() == "true"
            if is_primary:
                ProductImage.objects.filter(product=product, is_primary=True).update(
                    is_primary=False
                )
            image = ProductImage.objects.create(
                product=product,
                image_url=image_url,
                public_id="",
                is_primary=is_primary,
            )
            return Response(
                ProductImageSerializer(image).data, status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def remove_image(self, request, id=None):
        product = self.get_object()
        image_id = request.data.get("image_id")
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            if image.public_id:
                try:
                    delete_from_cloudinary(image.public_id)
                except Exception:
                    pass
            image.delete()
            return Response({"message": "Image removed"}, status=status.HTTP_200_OK)
        except ProductImage.DoesNotExist:
            return Response(
                {"message": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def replace_image(self, request, id=None):
        product = self.get_object()
        image_id = request.data.get("image_id")
        file = request.FILES.get("file")
        if not image_id or not file:
            return Response(
                {"message": "image_id and file are required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            if image.public_id:
                try:
                    delete_from_cloudinary(image.public_id)
                except Exception:
                    pass
            result = upload_to_cloudinary(file)
            image.image_url = result["url"]
            image.public_id = result["public_id"]
            image.save()
            return Response(
                ProductImageSerializer(image).data, status=status.HTTP_200_OK
            )
        except ProductImage.DoesNotExist:
            return Response(
                {"message": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def set_primary_image(self, request, id=None):
        product = self.get_object()
        image_id = request.data.get("image_id")
        if not image_id:
            return Response(
                {"message": "image_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            ProductImage.objects.filter(product=product, is_primary=True).update(
                is_primary=False
            )
            image.is_primary = True
            image.save()
            return Response(
                ProductImageSerializer(image).data, status=status.HTTP_200_OK
            )
        except ProductImage.DoesNotExist:
            return Response(
                {"message": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )
