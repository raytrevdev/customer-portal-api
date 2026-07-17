const BaseRepository = require('./base.repository');
const { Customer } = require('../models');

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  findByEmail(email) {
    return this.model.findOne({ where: { email } });
  }
}

module.exports = new CustomerRepository();
