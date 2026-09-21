const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/requestValidator');

const {
  createOrderValidator,
  updateStatusValidator,
  assignDriverValidator,
  orderIdParamValidator,
  listOrdersQueryValidator
} = require('../validators/orderValidator');

// POST /api/orders
// Only authenticated customers can create orders
router.post(
  '/',
  authenticate,
  authorize('customer'),
  createOrderValidator,
  validateRequest,
  orderController.createOrder
);

// GET /api/orders
// Authentication required
router.get(
  '/',
  authenticate,
  listOrdersQueryValidator,
  validateRequest,
  orderController.listOrders
);

// GET /api/orders/summary
// Admin stats endpoint
router.get(
  '/summary',
  authenticate,
  orderController.getOrderSummary
);

// GET /api/orders/:id
// Authentication required
router.get(
  '/:id',
  authenticate,
  orderIdParamValidator,
  validateRequest,
  orderController.getOrderById
);

// PATCH /api/orders/:id/status
// Drivers, admins, and restaurants can update order status
router.patch(
  '/:id/status',
  authenticate,
  authorize('driver', 'admin', 'restaurant'),
  updateStatusValidator,
  validateRequest,
  orderController.updateOrderStatus
);

// PATCH /api/orders/:id/assign-driver
// Only admins can assign drivers (and customer for demo)
router.patch(
  '/:id/assign-driver',
  authenticate,
  authorize('admin', 'customer'),
  assignDriverValidator,
  validateRequest,
  orderController.assignDriver
);

module.exports = router;