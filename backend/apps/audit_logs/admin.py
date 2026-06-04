from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["user", "action", "table_name", "created_at"]
    list_filter = ["action", "table_name"]
    search_fields = ["user__email"]
    date_hierarchy = "created_at"
    readonly_fields = ["user", "action", "table_name", "object_id", "old_data", "new_data", "created_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
