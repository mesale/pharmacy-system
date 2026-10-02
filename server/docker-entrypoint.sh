#!/bin/bash

# Run migrations
php artisan migrate --force

# Run seeders (in background so we don't block port 80 binding)
php artisan db:seed --force &
php artisan db:seed --class=DemoSeeder --force &

# Fix permissions in case migrate created log files as root
chown -R www-data:www-data /var/www/html/storage

# Execute the main CMD (which is apache2-foreground)
exec "$@"
