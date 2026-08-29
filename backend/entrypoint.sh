#!/bin/sh

set -e

while ! nc -z db 3306; do
  sleep 0.5
done

echo "Applying database migrations..."
python manage.py migrate

if [ "$SEED_ON_START" != "false" ]; then
  if python manage.py shell -c \
    "from users.models import CustomUser; import sys; sys.exit(0 if CustomUser.objects.filter(username__startswith='user_').exists() else 1)" \
    >/dev/null 2>&1; then
    echo "Seed data already present, skipping seed_all."
  else
    echo "Seeding database with sample data..."
    python manage.py seed_all
  fi
fi

echo "Starting Django..."
exec "$@"