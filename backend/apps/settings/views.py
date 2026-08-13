from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import SiteSettings, FooterSettings
from .serializers import SiteSettingsSerializer, FooterSettingsSerializer
from core.permissions import IsSuperAdmin
from apps.products.cloudinary_utils import upload_to_cloudinary, delete_from_cloudinary, validate_image_file
import logging

logger = logging.getLogger(__name__)


class SiteSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsSuperAdmin()]

    def get(self, request):
        instance = SiteSettings.get_instance()
        serializer = SiteSettingsSerializer(instance)
        return Response(serializer.data)

    def put(self, request):
        instance = SiteSettings.get_instance()
        serializer = SiteSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class FooterView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsSuperAdmin()]

    def get(self, request):
        instance = FooterSettings.get_instance()
        serializer = FooterSettingsSerializer(instance)
        return Response(serializer.data)

    def put(self, request):
        instance = FooterSettings.get_instance()
        serializer = FooterSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UploadLogoView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"message": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        error = validate_image_file(file)
        if error:
            return error
        try:
            result = upload_to_cloudinary(file, folder="logos")
            instance = SiteSettings.get_instance()
            if instance.site_logo_public_id:
                try:
                    delete_from_cloudinary(instance.site_logo_public_id)
                except Exception:
                    pass
            instance.site_logo_url = result["url"]
            instance.site_logo_public_id = result["public_id"]
            instance.save(update_fields=["site_logo_url", "site_logo_public_id"])
            return Response({"url": result["url"]}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Upload logo failed")
            return Response(
                {"message": "Upload failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContactView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name", "")
        email = request.data.get("email", "")
        phone = request.data.get("phone", "")
        subject = request.data.get("subject", "")
        message = request.data.get("message", "")
        return Response(
            {"message": "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất."},
            status=status.HTTP_200_OK,
        )
