const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const validateRequest = require('../middleware/requestValidator');
const {
  createOrderValidator,
  updateStatusValidator,
  assignDriverValidator,
  orderIdParamValidator,
  listOrdersQueryValidator
} = require('../validators/orderValidator');

// POST /api/orders - Create new order
router.post('/', createOrderValidator, validateRequest, orderController.createOrder);

// GET /api/orders - List orders with pagination, filtering & sorting
router.get('/', listOrdersQueryValidator, validateRequest, orderController.listOrders);

// GET /api/orders/:id - Get order details
router.get('/:id', orderIdParamValidator, validateRequest, orderController.getOrderById);

// PATCH /api/orders/:id/status - Transition order status
router.patch('/:id/status', updateStatusValidator, validateRequest, orderController.updateOrderStatus);

// PATCH /api/orders/:id/assign-driver - Assign driver to ready order (Role 5 integration)
router.patch('/:id/assign-driver', assignDriverValidator, validateRequest, orderController.assignDriver);

module.exports = router;
