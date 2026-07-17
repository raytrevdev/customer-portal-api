const { Model, DataTypes } = require('sequelize');

const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
    }
  }

  Order.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      customerId: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.ENUM(...ORDER_STATUSES), allowNull: false, defaultValue: 'pending' },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    },
    { sequelize, modelName: 'Order', tableName: 'orders' }
  );

  Order.STATUSES = ORDER_STATUSES;
  return Order;
};
