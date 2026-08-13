import cloudinary.uploader
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from io import BytesIO
from PIL import Image

MAX_IMAGE_SIZE = 5 * 1024 * 1024


def validate_image_file(file):
    if file.size > MAX_IMAGE_SIZE:
        return Response(
            {"message": "File too large (max 5MB)"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not file.content_type.startswith("image/"):
        return Response(
            {"message": "Only image files are allowed"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        file.seek(0)
        Image.open(BytesIO(file.read(1024 * 1024))).verify()
        file.seek(0)
    except Exception:
        return Response(
            {"message": "Invalid image file"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return None


def upload_to_cloudinary(file, folder="products"):
    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        resource_type="image",
    )
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_from_cloudinary(public_id):
    cloudinary.uploader.destroy(public_id)
