from django.urls import path
from .views import SiteSettingsView, FooterView, ContactView, UploadLogoView

urlpatterns = [
    path("site", SiteSettingsView.as_view(), name="settings-site"),
    path("site/upload-logo", UploadLogoView.as_view(), name="settings-upload-logo"),
    path("footer", FooterView.as_view(), name="settings-footer"),
    path("contact", ContactView.as_view(), name="settings-contact"),
]
