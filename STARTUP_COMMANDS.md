# Recommended daily startup commands
Once the project exists, this is the routine you will use most often.

## Terminal 1: infrastructure

cd ~/projects/latvia-company-dashboard
docker compose up -d
docker ps

## Terminal 2: Laravel

cd ~/projects/latvia-company-dashboard/backend
php artisan serve

## Terminal 3: queue worker

cd ~/projects/latvia-company-dashboard/backend
php artisan queue:work

## Terminal 4: scheduler

cd ~/projects/latvia-company-dashboard/backend
php artisan schedule:work

## Terminal 5: Next.js

cd ~/projects/latvia-company-dashboard/frontend
npm run dev


Useful maintenance commands
These are the commands you will use constantly during development.

## Laravel
php artisan optimize:clear
php artisan route:list
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed
php artisan test
composer dump-autoload

## Docker
docker compose up -d
docker compose down
docker compose restart
docker logs lcd_postgres
docker logs lcd_opensearch

## Next.js
npm run dev
npm run build
npm run lint