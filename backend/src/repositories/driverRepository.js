const Driver = require('../models/Driver');

/**
 * Repository layer for Driver data access.
 */
class DriverRepository {
  /**
   * Find all drivers who are currently available.
   *
   * @returns {Promise<Driver[]>}
   */
  async findAvailableDrivers() {
    return await Driver.find({
      available: true
    }).lean();
  }

  /**
   * Find a driver by driverId.
   *
   * @param {string} driverId
   * @returns {Promise<Driver|null>}
   */
  async findByDriverId(driverId) {
    return await Driver.findOne({ driverId }).lean();
  }

  /**
   * Create a driver.
   *
   * @param {object} driverData
   * @returns {Promise<Driver>}
   */
  async create(driverData) {
    const driver = new Driver(driverData);
    return await driver.save();
  }
}

module.exports = new DriverRepository();