from django.contrib import admin
from django.utils.html import format_html
from .models import Slider
from apps.common.admin_mixins import cloudinary_image_admin


@admin.register(Slider)
class SliderAdmin(cloudinary_image_admin(url_field="image_url", public_id_field="image_public_id", folder="sliders")):
    list_display = ["title", "image_preview", "link_url", "is_active", "sort_order"]
    list_filter = ["is_active"]
    list_editable = ["sort_order"]
    search_fields = ["title", "subtitle"]
    readonly_fields = ["image_url", "image_public_id"]

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(f'<img src="{obj.image_url}" style="width:80px;height:50px;object-fit:cover;border-radius:4px" />')
        return "-"
    image_preview.short_description = "Ảnh"
