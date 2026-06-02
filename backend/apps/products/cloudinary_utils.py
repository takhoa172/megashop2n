import cloudinary.uploader
from django.conf import settings


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
