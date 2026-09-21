const orderService = require('../services/orderService');
const driverAllocationService = require('../services/driverAllocationService');
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
      const { restaurantId, deliveryAddress, items } = req.body;

      const order = await orderService.createOrder({
        customerId: req.user.id,
        restaurantId,
        deliveryAddress,
        items
      });
      
      const io = req.app.get('io');
      if (io) {
        io.emit('order_created', order);
      }
      
      return sendSuccess(res, 201, 'Order created successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/summary
   */
  async getOrderSummary(req, res, next) {
    try {
      // Mock summary data for dashboard
      const summary = {
        totalOrders: 15,
        totalAmount: 45000,
        byStatus: {
          PLACED: { count: 2, amount: 4500 },
          ACCEPTED: { count: 3, amount: 9000 },
          PREPARING: { count: 4, amount: 12000 },
          READY: { count: 1, amount: 3500 },
          DRIVER_ASSIGNED: { count: 1, amount: 2500 },
          PICKED_UP: { count: 2, amount: 6000 },
          DELIVERED: { count: 2, amount: 7500 },
          REJECTED: { count: 0, amount: 0 }
        }
      };
      return sendSuccess(res, 200, 'Order summary retrieved', summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);
      return sendSuccess(res, 200, 'Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   */
  /**
 * GET /api/orders
 */
async listOrders(req, res, next) {
  try {
    const query = { ...req.query };

    // Customers can only see their own orders.
    // Ignore any customerId supplied by the client.
    if (req.user.role === 'customer') {
      query.customerId = req.user.id;
    }

    const result = await orderService.listOrders(query);

    return sendSuccess(
      res,
      200,
      'Orders retrieved successfully',
      result
    );
  } catch (error) {
    next(error);
  }
}

  /**
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { status, cancellationReason } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status, cancellationReason);
      
      const io = req.app.get('io');
      if (io) {
        io.emit('order_updated', order);
        io.to(`order_${order._id}`).emit('order_updated', order);
      }
      
      // Automatic Driver Allocation when order is marked READY
      if (status === 'READY') {
        // Trigger asynchronously so it doesn't block the API response
        driverAllocationService.allocateDriver(order._id, null)
          .then(result => {
            if (io) {
              const orderWithDriver = result.order.toObject ? result.order.toObject() : { ...result.order };
              if (result.selectedDriver) {
                orderWithDriver.driver = result.selectedDriver;
              }
              io.emit('driver_assigned', orderWithDriver);
              io.to(`order_${order._id}`).emit('driver_assigned', orderWithDriver);
              if (result.selectedDriver) {
                io.to(`driver_${result.selectedDriver.driverId}`).emit('new_assignment', orderWithDriver);
              }
            }
          })
          .catch(err => {
            console.error(`Failed to auto-allocate driver for order ${order._id}:`, err);
          });
      }

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
    const {
      driverId,
      requiredVehicleType
    } = req.body;

    // AUTO mode invokes Role 5 driver allocation.
    if (driverId === 'AUTO') {
      const result =
        await driverAllocationService.allocateDriver(
          req.params.id,
          requiredVehicleType || null
        );

        const io = req.app.get('io');
        if (io) {
          io.emit('driver_assigned', result.order);
          io.to(`order_${req.params.id}`).emit('driver_assigned', result.order);
          if (result.selectedDriver) {
            io.to(`driver_${result.selectedDriver._id}`).emit('new_assignment', result.order);
          }
        }

        return sendSuccess(
          res,
          200,
          `Driver automatically allocated: ${result.selectedDriver.name}`,
          result
        );
      }

      // Existing manual assignment behaviour.
      const order = await orderService.assignDriver(req.params.id, driverId);

      const io = req.app.get('io');
      if (io) {
        io.emit('driver_assigned', order);
        io.to(`order_${order._id}`).emit('driver_assigned', order);
        io.to(`driver_${driverId}`).emit('new_assignment', order);
      }

      return sendSuccess(
        res,
        200,
        'Driver assigned successfully',
        order
      );
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
