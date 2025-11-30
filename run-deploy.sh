#!/bin/bash
# AngularPress deployment script - runs on the server

set -e
cd /opt/angularpress

echo "Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

echo "Building containers (this will take several minutes)..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "Waiting for containers to be healthy..."
sleep 15

echo "Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Updating nginx configuration..."
cp nginx-server.conf /etc/nginx/sites-available/angularpress.iffuso.com

echo "Testing nginx configuration..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo ""
echo "Deployment complete!"

