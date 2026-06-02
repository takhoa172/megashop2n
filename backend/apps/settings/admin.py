from django.contrib import admin
from django.utils.html import format_html
from .models import SiteSettings, FooterSettings
from apps.common.admin_mixins import cloudinary_image_admin


@admin.register(SiteSettings)
class SiteSettingsAdmin(cloudinary_image_admin(url_field="site_logo_url", public_id_field=None, folder="logos")):
    list_display = ["site_name", "logo_preview", "updated_at"]
    readonly_fields = ["site_logo_url"]
    fieldsets = [
        ("Thông tin chung", {"fields": ["site_name", "image_file", "meta_description"]}),
        ("Điều hướng", {"fields": ["nav_links"]}),
    ]

    def logo_preview(self, obj):
        if obj.site_logo_url:
            return format_html(f'<img src="{obj.site_logo_url}" style="max-width:100px;max-height:40px;object-fit:contain;border-radius:4px" />')
        return "-"
    logo_preview.short_description = "Logo"

    def has_add_permission(self, request):
        if SiteSettings.objects.exists():
            return False
        return True


@admin.register(FooterSettings)
class FooterSettingsAdmin(admin.ModelAdmin):
    list_display = ["company_name", "phone", "email"]

    def has_add_permission(self, request):
        if FooterSettings.objects.exists():
            return False
        return True
