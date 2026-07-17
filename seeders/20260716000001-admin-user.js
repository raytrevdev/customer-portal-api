'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const email = process.env.ADMIN_EMAIL || 'admin@portal.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Idempotent: skip if the admin already exists.
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM customers WHERE email = :email LIMIT 1;`,
      { replacements: { email }, type: Sequelize.QueryTypes.SELECT }
    );
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 10);
    await queryInterface.bulkInsert('customers', [
      {
        id: require('crypto').randomUUID(),
        name: 'System Administrator',
        email,
        passwordHash,
        phone: null,
        address: null,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL || 'admin@portal.com';
    await queryInterface.bulkDelete('customers', { email });
  },
};
