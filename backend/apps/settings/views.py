from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import SiteSettings, FooterSettings
from .serializers import SiteSettingsSerializer, FooterSettingsSerializer
from core.permissions import IsSuperAdmin
from apps.products.cloudinary_utils import upload_to_cloudinary


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
        try:
            result = upload_to_cloudinary(file)
            instance = SiteSettings.get_instance()
            instance.site_logo_url = result["url"]
            instance.save(update_fields=["site_logo_url"])
            return Response({"url": result["url"]}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
