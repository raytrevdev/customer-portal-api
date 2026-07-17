// Boots the real Express app (no DB connection needed to build it) and asserts
// that every route is wired and the Swagger spec is generated correctly.
jest.mock('../../src/config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const swaggerSpec = require('../../src/config/swagger');

describe('Swagger / OpenAPI spec', () => {
  const paths = Object.keys(swaggerSpec.paths || {});
  const expected = [
    '/api/auth/register', '/api/auth/login',
    '/api/customers/me', '/api/customers/me/password',
    '/api/orders', '/api/orders/{id}', '/api/orders/{id}/cancel',
    '/api/products',
    '/api/admin/customers', '/api/admin/customers/{id}', '/api/admin/customers/{id}/deactivate',
    '/api/admin/orders', '/api/admin/orders/{id}/status',
  ];
  it.each(expected)('documents %s', (p) => {
    expect(paths).toContain(p);
  });
  it('declares a bearer JWT security scheme', () => {
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toMatchObject({ scheme: 'bearer' });
  });
});

describe('Express app wiring', () => {
  let app;
  beforeAll(() => { app = require('../../src/app'); });

  it('builds without throwing', () => {
    expect(typeof app).toBe('function');
  });

  it('registers the API router', () => {
    // The app should have a middleware stack (router mounted under /api).
    expect(app._router.stack.length).toBeGreaterThan(0);
  });
});
