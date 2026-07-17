// Configuration consumed by sequelize-cli for migrations and seeders.
require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'customer_portal',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: { ...common },
  test: { ...common, database: (process.env.DB_NAME || 'customer_portal') + '_test' },
  production: { ...common },
};
