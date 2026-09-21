const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller handling Order HTTP requests
 * Remains thin, delegating business logic to orderService
 */
class OrderController {
  /**
   * POST /api/orders
   */
  async createOrder(req, res, next) {
    try {
      const { customerId, restaurantId, deliveryAddress, items } = req.body;
      const order = await orderService.createOrder({
        customerId,
        restaurantId,
        deliveryAddress,
        items
      });
      return sendSuccess(res, 201, 'Order created successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      return sendSuccess(res, 200, 'Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   */
  async listOrders(req, res, next) {
    try {
      const result = await orderService.listOrders(req.query);
      return sendSuccess(res, 200, 'Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      return sendSuccess(res, 200, 'Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/:id/assign-driver
   */
  async assignDriver(req, res, next) {
    try {
      const { driverId } = req.body;
      const order = await orderService.assignDriver(req.params.id, driverId);
      return sendSuccess(res, 200, 'Driver assigned successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/restaurants/:restaurantId/orders
   */
  async getRestaurantOrders(req, res, next) {
    try {
      const result = await orderService.getRestaurantOrders(req.params.restaurantId, req.query);
      return sendSuccess(res, 200, 'Restaurant orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
