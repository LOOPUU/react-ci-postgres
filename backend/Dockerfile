FROM php:8.3-apache
# ติดตั้งส่วนขยายที่ CodeIgniter และ PostgreSQL ต้องใช้
RUN apt-get update && apt-get install -y --no-install-recommends libicu-dev libpq-dev libonig-dev unzip git curl \
    && docker-php-ext-install intl mbstring pgsql pdo_pgsql \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader \
    && chown -R www-data:www-data writable
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/app-entrypoint
RUN chmod +x /usr/local/bin/app-entrypoint
ENTRYPOINT ["app-entrypoint"]
CMD ["apache2-foreground"]
