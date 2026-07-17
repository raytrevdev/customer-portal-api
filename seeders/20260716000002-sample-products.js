'use strict';
const crypto = require('crypto');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [count] = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS c FROM products;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (count && count.c > 0) return; // already seeded

    const now = new Date();
    const products = [
      { name: 'Wireless Mouse', price: 25.9 },
      { name: 'Mechanical Keyboard', price: 89.0 },
      { name: '27" Monitor', price: 210.5 },
      { name: 'USB-C Hub', price: 39.99 },
      { name: 'Laptop Stand', price: 45.0 },
    ].map((p) => ({ id: crypto.randomUUID(), ...p, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert('products', products);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  },
};
