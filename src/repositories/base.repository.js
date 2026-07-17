// Generic data-access wrapper. Keeps Sequelize confined to the repository layer
// so services depend on an abstraction rather than the ORM directly.
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data, options = {}) { return this.model.create(data, options); }
  findById(id, options = {}) { return this.model.findByPk(id, options); }
  findOne(where, options = {}) { return this.model.findOne({ where, ...options }); }

  findAndCountAll({ where = {}, limit, offset, order, include } = {}) {
    return this.model.findAndCountAll({ where, limit, offset, order, include });
  }

  async update(instance, data) { return instance.update(data); }
  async destroy(instance) { return instance.destroy(); }
}

module.exports = BaseRepository;
