const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const orderController = require('../controllers/orderController');
const restaurantController = require('../controllers/restaurantController');
const validateRequest = require('../middleware/requestValidator');
const { restaurantMenuValidator } = require('../validators/menuValidator');
const { listOrdersQueryValidator } = require('../validators/orderValidator');

// GET /api/restaurants - List all restaurants
router.get('/', restaurantController.listRestaurants);

// GET /api/restaurants/:restaurantId/menu - Get restaurant menu with search/filter/sort/pagination
router.get('/:restaurantId/menu', restaurantMenuValidator, validateRequest, menuController.getRestaurantMenu);

// GET /api/restaurants/:restaurantId/orders - Get orders for a specific restaurant (Role 2 integration)
router.get('/:restaurantId/orders', listOrdersQueryValidator, validateRequest, orderController.getRestaurantOrders);

module.exports = router;
