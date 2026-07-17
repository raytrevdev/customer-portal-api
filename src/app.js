const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api', routes);

// Swagger UI is generated from the @openapi annotations in the route files.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { persistAuthorization: true },
  customSiteTitle: 'Customer Portal API Docs',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.get('/', (req, res) => res.json({
  success: true,
  message: 'Customer Portal API. Visit /api-docs for interactive documentation.',
}));

// 404 + error handler must be registered last.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
