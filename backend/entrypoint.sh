#!/bin/sh
set -e

python manage.py migrate

python manage.py shell -c "from apps.users.models import User; exit(0 if User.objects.exists() else 1)" && {
    echo "Database already seeded, skipping"
} || {
    echo "Seeding database..."
    python scripts/seed.py
    python scripts/seed_demo.py
    echo "Seeding complete"
}

exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4
