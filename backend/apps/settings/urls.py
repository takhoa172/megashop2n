from django.urls import path
from .views import SiteSettingsView, FooterView, ContactView

urlpatterns = [
    path("site", SiteSettingsView.as_view(), name="settings-site"),
    path("footer", FooterView.as_view(), name="settings-footer"),
    path("contact", ContactView.as_view(), name="settings-contact"),
]
