const Restaurant = require('../models/Restaurant');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class RestaurantController {
  async listRestaurants(req, res, next) {
    try {
      const { active, limit = 100, page = 1 } = req.query;
      
      const query = {};
      if (active !== undefined) {
        query.active = active === 'true';
      }

      const limitNum = parseInt(limit, 10);
      const pageNum = parseInt(page, 10);
      const skip = (pageNum - 1) * limitNum;

      const items = await Restaurant.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum);
        
      const totalItems = await Restaurant.countDocuments(query);
      
      res.json(ApiResponse.success(
        { items, pagination: { page: pageNum, limit: limitNum, totalItems, totalPages: Math.ceil(totalItems / limitNum) } },
        'Restaurants retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestaurantController();
