#!/bin/sh

set -e

while ! nc -z db 3306; do
  sleep 0.5
done

echo "Applying database migrations..."
python manage.py migrate

if [ "$SEED_ON_START" != "false" ]; then
  if python manage.py shell -c \
    "from companies.models import Company; import sys; sys.exit(0 if Company.objects.filter(name__startswith='seed_company_').exists() else 1)" \
    >/dev/null 2>&1; then
    echo "Seed data already present, skipping seed_all."
  else
    echo "Seeding database with sample data..."
    python manage.py seed_all
  fi
fi

echo "Starting Django..."
exec "$@"