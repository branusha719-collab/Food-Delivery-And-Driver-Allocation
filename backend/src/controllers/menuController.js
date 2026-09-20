const menuService = require('../services/menuService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller handling Menu HTTP requests
 */
class MenuController {
  /**
   * GET /api/restaurants/:restaurantId/menu
   */
  async getRestaurantMenu(req, res, next) {
    try {
      const result = await menuService.getRestaurantMenu(req.params.restaurantId, req.query);
      return sendSuccess(res, 200, 'Menu items retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/menu/:id
   */
  async getMenuItemById(req, res, next) {
    try {
      const menuItem = await menuService.getMenuItemById(req.params.id);
      return sendSuccess(res, 200, 'Menu item retrieved successfully', menuItem);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
