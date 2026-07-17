jest.mock('../../src/repositories/customer.repository');
jest.mock('../../src/config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const customerRepository = require('../../src/repositories/customer.repository');
const authService = require('../../src/services/auth.service');

const makeCustomer = (over = {}) => ({
  id: 'cust-1', name: 'Jane', email: 'jane@example.com', role: 'customer',
  isActive: true, passwordHash: '', toJSON() { const { passwordHash, ...rest } = this; return rest; }, ...over,
});

describe('AuthService.register', () => {
  it('rejects a duplicate email with 409', async () => {
    customerRepository.findByEmail.mockResolvedValue(makeCustomer());
    await expect(authService.register({ email: 'jane@example.com', password: 'x', name: 'J' }))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('hashes the password and returns a token for a new customer', async () => {
    customerRepository.findByEmail.mockResolvedValue(null);
    let storedHash;
    customerRepository.create.mockImplementation(async (data) => {
      storedHash = data.passwordHash;
      return makeCustomer({ passwordHash: data.passwordHash });
    });
    const result = await authService.register({ name: 'Jane', email: 'jane@example.com', password: 'Secret@123' });
    expect(result.token).toEqual(expect.any(String));
    expect(storedHash).not.toEqual('Secret@123'); // stored hashed, never plaintext
    expect(result.user).not.toHaveProperty('passwordHash');
  });
});

describe('AuthService.login', () => {
  it('rejects unknown email with 401', async () => {
    customerRepository.findByEmail.mockResolvedValue(null);
    await expect(authService.login({ email: 'no@one.com', password: 'x' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a deactivated account with 403', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('right', 10);
    customerRepository.findByEmail.mockResolvedValue(makeCustomer({ isActive: false, passwordHash: hash }));
    await expect(authService.login({ email: 'jane@example.com', password: 'right' }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects a wrong password with 401', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('right', 10);
    customerRepository.findByEmail.mockResolvedValue(makeCustomer({ passwordHash: hash }));
    await expect(authService.login({ email: 'jane@example.com', password: 'wrong' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns a token on valid credentials', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('right', 10);
    customerRepository.findByEmail.mockResolvedValue(makeCustomer({ passwordHash: hash }));
    const result = await authService.login({ email: 'jane@example.com', password: 'right' });
    expect(result.token).toEqual(expect.any(String));
  });
});
