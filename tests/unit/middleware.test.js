const authorize = require('../../src/middlewares/authorize');
const { errorHandler, notFound } = require('../../src/middlewares/errorHandler');
jest.mock('../../src/config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authorize middleware', () => {
  it('allows a matching role', () => {
    const next = jest.fn();
    authorize('admin')({ user: { role: 'admin' } }, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it('forbids a non-matching role with 403', () => {
    const next = jest.fn();
    authorize('admin')({ user: { role: 'customer' } }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('rejects an unauthenticated request with 401', () => {
    const next = jest.fn();
    authorize('admin')({}, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

describe('errorHandler', () => {
  it('maps a Sequelize unique constraint error to 409', () => {
    const res = mockRes();
    errorHandler({ name: 'SequelizeUniqueConstraintError' }, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('defaults unknown errors to 500', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('notFound produces a 404 ApiError', () => {
    const next = jest.fn();
    notFound({ method: 'GET', originalUrl: '/x' }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
