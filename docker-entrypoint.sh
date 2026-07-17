#!/bin/sh
set -e

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT} ..."
until node -e "
const { Client } = require('pg');
const c = new Client({
  host: process.env.DB_HOST, port: process.env.DB_PORT,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "  ...database not ready yet, retrying in 2s"
  sleep 2
done

echo "Database is ready. Running migrations..."
npx sequelize-cli db:migrate

echo "Seeding initial data (idempotent)..."
npx sequelize-cli db:seed:all || echo "Seeders already applied, continuing."

echo "Starting application..."
exec "$@"
