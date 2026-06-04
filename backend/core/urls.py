from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.settings.views import ContactView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/categories/", include("apps.categories.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/products/", include("apps.product_views.urls")),
    path("api/purchases/", include("apps.purchases.urls")),
    path("api/sales/", include("apps.sales.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/blogs/", include("apps.blogs.urls")),
    path("api/sliders/", include("apps.sliders.urls")),
    path("api/settings/", include("apps.settings.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/audit-logs/", include("apps.audit_logs.urls")),
    path("api/contact", ContactView.as_view(), name="contact"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
