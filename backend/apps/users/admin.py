from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "full_name", "role", "is_active"]
    list_filter = ["role", "is_active"]
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Personal info", {"fields": ["username", "full_name"]}),
        ("Permissions", {"fields": ["role", "is_active", "is_staff", "is_superuser"]}),
        ("Important dates", {"fields": ["last_login"]}),
    ]
    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                "fields": ["email", "username", "full_name", "password1", "password2", "role"],
            },
        ),
    ]
    search_fields = ["email", "username", "full_name"]
    ordering = ["email"]
