#!/bin/bash

# Run migrations
php artisan migrate --force

# Execute the main CMD (which is apache2-foreground)
exec "$@"
