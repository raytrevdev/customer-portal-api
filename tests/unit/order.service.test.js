jest.mock('../../src/models', () => {
  const tx = { LOCK: {} };
  return {
    sequelize: { transaction: (fn) => fn(tx) },
    Order: { STATUSES: ['pending', 'shipped', 'delivered', 'cancelled'] },
  };
});
jest.mock('../../src/repositories/order.repository');
jest.mock('../../src/repositories/orderItem.repository');
jest.mock('../../src/repositories/product.repository');
jest.mock('../../src/config/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }));

const orderRepository = require('../../src/repositories/order.repository');
const orderItemRepository = require('../../src/repositories/orderItem.repository');
const productRepository = require('../../src/repositories/product.repository');
const orderService = require('../../src/services/order.service');

describe('OrderService.placeOrder', () => {
  beforeEach(() => {
    productRepository.findByIds.mockResolvedValue([
      { id: 'p1', price: '25.00' },
      { id: 'p2', price: '10.50' },
    ]);
    orderItemRepository.bulkCreate.mockResolvedValue([]);
    orderRepository.findByIdWithItems.mockResolvedValue({ id: 'o1' });
  });

  it('rejects an empty order with 400', async () => {
    await expect(orderService.placeOrder('c1', [])).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects an unknown product with 400', async () => {
    await expect(orderService.placeOrder('c1', [{ productId: 'ghost', quantity: 1 }]))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('computes the correct total (2*25 + 3*10.50 = 81.50)', async () => {
    const updateSpy = jest.fn();
    orderRepository.create.mockResolvedValue({ id: 'o1', update: updateSpy });
    await orderService.placeOrder('c1', [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 3 },
    ]);
    expect(updateSpy).toHaveBeenCalledWith({ totalAmount: '81.50' }, expect.anything());
  });
});

describe('OrderService.cancelOrder', () => {
  const admin = { id: 'a', role: 'admin', email: 'a@a.com' };
  const owner = { id: 'c1', role: 'customer', email: 'c@c.com' };

  it('cancels a pending order owned by the customer', async () => {
    const update = jest.fn();
    orderRepository.findByIdWithItems.mockResolvedValue({ id: 'o1', customerId: 'c1', status: 'pending', update });
    await orderService.cancelOrder('o1', owner);
    expect(update).toHaveBeenCalledWith({ status: 'cancelled' });
  });

  it('refuses to cancel a shipped order with 400', async () => {
    orderRepository.findByIdWithItems.mockResolvedValue({ id: 'o1', customerId: 'c1', status: 'shipped', update: jest.fn() });
    await expect(orderService.cancelOrder('o1', owner)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('forbids cancelling another customer\'s order with 403', async () => {
    orderRepository.findByIdWithItems.mockResolvedValue({ id: 'o1', customerId: 'someone-else', status: 'pending', update: jest.fn() });
    await expect(orderService.cancelOrder('o1', owner)).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('OrderService.updateStatus', () => {
  it('rejects an invalid status with 400', async () => {
    await expect(orderService.updateStatus('o1', 'flying')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('updates a valid status', async () => {
    const update = jest.fn();
    orderRepository.findById.mockResolvedValue({ id: 'o1', update });
    orderRepository.findByIdWithItems.mockResolvedValue({ id: 'o1', status: 'shipped' });
    await orderService.updateStatus('o1', 'shipped');
    expect(update).toHaveBeenCalledWith({ status: 'shipped' });
  });
});
