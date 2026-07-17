// Real HTTP requests through the full middleware stack for paths that do not
// require a database (routing, validation, auth guard, 404, error handler).
jest.mock('../../src/config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const request = require('supertest');
const app = require('../../src/app');

describe('HTTP layer (DB-independent paths)', () => {
  it('GET / returns a friendly message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/health reports healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('unknown route returns 404 with an error envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it('register with an invalid body returns 400 (validation before DB)', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('login with a missing password returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  it('protected route without a token returns 401', async () => {
    const res = await request(app).get('/api/customers/me');
    expect(res.status).toBe(401);
  });

  it('admin route without a token returns 401', async () => {
    const res = await request(app).get('/api/admin/customers');
    expect(res.status).toBe(401);
  });

  it('placing an order with an invalid token returns 401', async () => {
    const res = await request(app).post('/api/orders')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ items: [{ productId: '11111111-1111-1111-1111-111111111111', quantity: 1 }] });
    expect(res.status).toBe(401);
  });
});
