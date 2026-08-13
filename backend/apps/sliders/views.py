from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Slider
from .serializers import SliderSerializer
from core.permissions import IsAdminOrReadOnly
from apps.products.cloudinary_utils import upload_to_cloudinary, delete_from_cloudinary, validate_image_file
import logging

logger = logging.getLogger(__name__)


class SliderViewSet(viewsets.ModelViewSet):
    queryset = Slider.objects.all()
    serializer_class = SliderSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method == "GET" and not self.request.query_params.get("all"):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=True, methods=["post"])
    def upload_image(self, request, pk=None):
        slider = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"message": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        error = validate_image_file(file)
        if error:
            return error
        try:
            if slider.image_public_id:
                try:
                    delete_from_cloudinary(slider.image_public_id)
                except Exception:
                    pass
            result = upload_to_cloudinary(file, folder="sliders")
            slider.image_url = result["url"]
            slider.image_public_id = result["public_id"]
            slider.save(update_fields=["image_url", "image_public_id"])
            return Response({"url": result["url"]}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Upload slider image failed")
            return Response(
                {"message": "Upload failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
