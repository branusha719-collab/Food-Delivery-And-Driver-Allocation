const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

/**
 * Repository layer for Restaurant and Menu data access
 */
class MenuRepository {
  /**
   * Finds a restaurant by ID
   * @param {string} restaurantId
   * @returns {Promise<Restaurant|null>}
   */
  async findRestaurantById(restaurantId) {
    return await Restaurant.findById(restaurantId);
  }

  /**
   * Finds multiple menu items by their IDs
   * @param {string[]} ids
   * @returns {Promise<MenuItem[]>}
   */
  async findMenuItemsByIds(ids) {
    return await MenuItem.find({ _id: { $in: ids } });
  }

  /**
   * Finds a single menu item by ID
   * @param {string} id
   * @returns {Promise<MenuItem|null>}
   */
  async findMenuItemById(id) {
    return await MenuItem.findById(id).populate('restaurantId', 'name address active');
  }

  /**
   * Finds paginated, filtered, and sorted menu items
   * @param {object} params
   * @param {object} params.filter
   * @param {number} params.skip
   * @param {number} params.limit
   * @param {object} params.sort
   * @returns {Promise<MenuItem[]>}
   */
  async findMenuItemsPaginated({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } }) {
    return await MenuItem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Counts menu items matching the filter
   * @param {object} filter
   * @returns {Promise<number>}
   */
  async countMenuItems(filter = {}) {
    return await MenuItem.countDocuments(filter);
  }
}

module.exports = new MenuRepository();
