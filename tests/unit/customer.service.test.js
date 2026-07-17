jest.mock('../../src/repositories/customer.repository');
jest.mock('../../src/config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const customerRepository = require('../../src/repositories/customer.repository');
const customerService = require('../../src/services/customer.service');
const bcrypt = require('bcryptjs');

describe('CustomerService.changePassword', () => {
  it('rejects a wrong current password with 400', async () => {
    const hash = await bcrypt.hash('current', 10);
    customerRepository.findById.mockResolvedValue({ id: 'c1', email: 'c@c.com', passwordHash: hash });
    await expect(customerService.changePassword('c1', { currentPassword: 'nope', newPassword: 'newpass' }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('updates the password hash on correct current password', async () => {
    const hash = await bcrypt.hash('current', 10);
    const update = jest.fn();
    customerRepository.findById.mockResolvedValue({ id: 'c1', email: 'c@c.com', passwordHash: hash });
    customerRepository.update.mockImplementation(update);
    await customerService.changePassword('c1', { currentPassword: 'current', newPassword: 'newpass' });
    expect(update).toHaveBeenCalled();
    const [, changes] = update.mock.calls[0];
    expect(changes.passwordHash).not.toEqual('newpass');
  });
});

describe('CustomerService admin guards', () => {
  it('refuses to delete an admin account with 403', async () => {
    customerRepository.findById.mockResolvedValue({ id: 'a1', role: 'admin', email: 'a@a.com' });
    await expect(customerService.deleteCustomer('a1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('returns 404 when deactivating a missing customer', async () => {
    customerRepository.findById.mockResolvedValue(null);
    await expect(customerService.deactivateCustomer('ghost')).rejects.toMatchObject({ statusCode: 404 });
  });
});
