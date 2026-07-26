#!/bin/sh

set -e

while ! nc -z db 3306; do
  sleep 0.5
done

echo "Applying database migrations..."
python manage.py migrate

echo "Starting Django..."
exec "$@"