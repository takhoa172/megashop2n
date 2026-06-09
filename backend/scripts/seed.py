import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")
django.setup()

from apps.users.models import User
from apps.categories.models import Category
from apps.products.models import Product
from django.utils.text import slugify


def seed():
    if not User.objects.filter(email="admin@example.com").exists():
        admin = User.objects.create_superuser(
            email="admin@example.com",
            username="admin",
            full_name="Admin",
            password="admin123",
        )
        print(f"Created super admin: {admin.email} / admin123")
    else:
        print("Admin already exists")

    for role, email, name in [
        ("MANAGER", "manager@example.com", "Manager User"),
        ("STAFF", "staff@example.com", "Staff User"),
    ]:
        if not User.objects.filter(email=email).exists():
            User.objects.create_user(
                email=email,
                username=email.split("@")[0],
                full_name=name,
                password="password123",
                role=role,
            )
            print(f"Created {role}: {email} / password123")

    categories_data = [
        "Đồ chơi", "Mô hình", "Đồ sưu tầm", "Đồ cũ", "Phụ kiện",
    ]
    for cat_name in categories_data:
        Category.objects.get_or_create(
            name=cat_name, defaults={"slug": slugify(cat_name)}
        )
    print(f"Created {Category.objects.count()} categories")

    if not User.objects.filter(email="customer@example.com").exists():
        User.objects.create_user(
            email="customer@example.com",
            username="customer",
            full_name="Customer User",
            password="password123",
            role="CUSTOMER",
        )
        print(f"Created CUSTOMER: customer@example.com / password123")

    print("\nSeed complete!")
    print("  Admin: admin@example.com / admin123")
    print("  Manager: manager@example.com / password123")
    print("  Staff: staff@example.com / password123")
    print("  Customer: customer@example.com / password123")


if __name__ == "__main__":
    seed()
