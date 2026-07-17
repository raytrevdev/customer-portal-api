const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const { sequelize } = require('./src/models');

async function start() {
  try {
    // Verify the database connection before accepting traffic.
    await sequelize.authenticate();
    logger.info('Database connection established.');

    app.listen(env.port, () => {
      logger.info(`Server running on http://localhost:${env.port}`);
      logger.info(`Swagger docs at http://localhost:${env.port}/api-docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

start();
