const menuRepository = require('../repositories/menuRepository');
const ApiError = require('../utils/apiError');
const { ERROR_CODES } = require('../utils/errorCodes');

const ALLOWED_MENU_SORT_FIELDS = Object.freeze(['price', 'name', 'createdAt', 'category']);

/**
 * Service handling Menu querying, filtering, search, and pagination
 */
class MenuService {
  /**
   * Retrieves paginated, filtered menu items for a restaurant
   * @param {string} restaurantId
   * @param {object} query
   * @returns {Promise<object>}
   */
  async getRestaurantMenu(restaurantId, query = {}) {
    // 1. Verify restaurant exists
    const restaurant = await menuRepository.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', ERROR_CODES.RESTAURANT_NOT_FOUND);
    }

    // 2. Pagination setup
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // 3. Filter criteria
    const filter = { restaurantId };

    if (query.category) {
      filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
    }

    if (query.available !== undefined && query.available !== '') {
      filter.available = query.available === 'true' || query.available === true;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // 4. Whitelisted Sorting
    const requestedSortBy = query.sortBy || 'createdAt';
    const sortBy = ALLOWED_MENU_SORT_FIELDS.includes(requestedSortBy) ? requestedSortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [items, totalItems] = await Promise.all([
      menuRepository.findMenuItemsPaginated({ filter, skip, limit, sort }),
      menuRepository.countMenuItems(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        address: restaurant.address,
        active: restaurant.active
      },
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    };
  }

  /**
   * Retrieves single menu item by ID
   * @param {string} menuItemId
   * @returns {Promise<object>}
   */
  async getMenuItemById(menuItemId) {
    const menuItem = await menuRepository.findMenuItemById(menuItemId);
    if (!menuItem) {
      throw new ApiError(404, `Menu item with ID ${menuItemId} not found`, ERROR_CODES.MENU_ITEM_NOT_FOUND);
    }
    return menuItem;
  }
}

module.exports = new MenuService();
