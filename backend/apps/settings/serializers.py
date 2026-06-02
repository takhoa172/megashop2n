from rest_framework import serializers
from .models import SiteSettings, FooterSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "id", "site_name", "site_logo_url", "nav_links",
            "meta_description",
        ]
        read_only_fields = ["id"]


class FooterSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSettings
        fields = [
            "id", "company_name", "address", "phone", "email",
            "facebook", "youtube", "twitter", "instagram",
            "copyright_text", "description",
        ]
        read_only_fields = ["id"]
