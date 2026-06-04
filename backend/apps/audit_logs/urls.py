from django.urls import path
from .views import AuditLogViewSet

audit_list = AuditLogViewSet.as_view({"get": "list"})
audit_detail = AuditLogViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    path("", audit_list, name="audit-logs"),
    path("<uuid:pk>", audit_detail, name="audit-log-detail"),
]
