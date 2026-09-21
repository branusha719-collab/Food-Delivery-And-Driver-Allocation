const Order = require('../models/Order');

/**
 * Repository layer for Order data access
 * Keeps Mongoose operations decoupled from business services
 */
class OrderRepository {
  /**
   * Creates and persists a new Order
   * @param {object} orderData
   * @returns {Promise<Order>}
   */
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  /**
   * Finds an order by its ID
   * @param {string} orderId
   * @returns {Promise<Order|null>}
   */
  async findById(orderId) {
    return await Order.findById(orderId).populate('restaurantId', 'name address latitude longitude');
  }

  /**
   * Finds raw order document by ID for state mutations
   * @param {string} orderId
   * @returns {Promise<Order|null>}
   */
  async findRawById(orderId) {
    return await Order.findById(orderId);
  }

  /**
   * Finds paginated, filtered, and sorted orders
   * @param {object} params
   * @param {object} params.filter - MongoDB filter query
   * @param {number} params.skip - Number of records to skip
   * @param {number} params.limit - Number of records to return
   * @param {object} params.sort - Sort specification
   * @returns {Promise<Order[]>}
   */
  async findPaginated({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } }) {
    return await Order.find(filter)
      .populate('restaurantId', 'name address')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Counts total documents matching the filter
   * @param {object} filter
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    return await Order.countDocuments(filter);
  }

  /**
   * Atomically updates order status only if current status matches expectedCurrentStatus
   * Prevents concurrent race conditions
   * @param {string} orderId
   * @param {string} expectedCurrentStatus
   * @param {string} nextStatus
   * @returns {Promise<Order|null>}
   */
  async updateStatus(orderId, expectedCurrentStatus, nextStatus) {
    return await Order.findOneAndUpdate(
      {
        _id: orderId,
        status: expectedCurrentStatus
      },
      { status: nextStatus },
      { new: true, runValidators: true }
    ).populate('restaurantId', 'name address');
  }

  /**
   * Atomically assigns driver to an order only if current status is READY
   * Guarantees race-condition safety: cannot assign twice or overwrite concurrently
   * @param {string} orderId
   * @param {string} driverId
   * @param {string} nextStatus
   * @returns {Promise<Order|null>}
   */
  async assignDriver(orderId, driverId, nextStatus) {
    return await Order.findOneAndUpdate(
      {
        _id: orderId,
        status: { $in: ['READY', 'PLACED'] }
      },
      {
        driverId,
        status: nextStatus
      },
      { new: true, runValidators: true }
    ).populate('restaurantId', 'name address');
  }
}

module.exports = new OrderRepository();
