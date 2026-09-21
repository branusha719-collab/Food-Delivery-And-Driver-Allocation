const orderRepository = require('../repositories/orderRepository');
const menuRepository = require('../repositories/menuRepository');
const ApiError = require('../utils/apiError');
const { ERROR_CODES } = require('../utils/errorCodes');
const { ORDER_STATUS } = require('../utils/orderStatus');
const { isValidOrderTransition } = require('../utils/orderStateMachine');
const { calculateItemSubtotal, calculateOrderSubtotal, calculateDeliveryFee } = require('../utils/money');

const ALLOWED_ORDER_SORT_FIELDS = Object.freeze(['createdAt', 'totalAmount', 'subtotal', 'status']);

/**
 * Service handling all core business rules for orders and the order lifecycle
 */
class OrderService {
  /**
   * Creates an order with strict server-side price calculation and availability validation
   * @param {object} params
   * @param {string} params.customerId
   * @param {string} params.restaurantId
   * @param {string} params.deliveryAddress
   * @param {Array<{ menuItemId: string, quantity: number }>} params.items
   * @returns {Promise<object>}
   */
  async createOrder({ customerId, restaurantId, deliveryAddress, items }) {
    // 1. Verify restaurant existence and active status
    const restaurant = await menuRepository.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', ERROR_CODES.RESTAURANT_NOT_FOUND);
    }
    if (!restaurant.active) {
      throw new ApiError(400, 'Restaurant is currently inactive and cannot accept orders', ERROR_CODES.RESTAURANT_INACTIVE);
    }

    // 2. Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item', ERROR_CODES.VALIDATION_ERROR);
    }

    // 3. Fetch menu items from database
    const menuItemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await menuRepository.findMenuItemsByIds(menuItemIds);
    const dbMenuMap = new Map(dbMenuItems.map((item) => [item._id.toString(), item]));

    // 4. Validate each requested item
    const orderItemsSnapshot = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new ApiError(400, `Quantity for item ${item.menuItemId} must be a positive integer greater than 0`, ERROR_CODES.INVALID_QUANTITY);
      }

      const dbItem = dbMenuMap.get(item.menuItemId.toString());
      if (!dbItem) {
        throw new ApiError(404, `Menu item with ID ${item.menuItemId} was not found`, ERROR_CODES.MENU_ITEM_NOT_FOUND);
      }

      // Check if menu item belongs to the specified restaurant
      if (dbItem.restaurantId.toString() !== restaurantId.toString()) {
        throw new ApiError(
          400,
          `Menu item "${dbItem.name}" does not belong to the selected restaurant`,
          ERROR_CODES.MENU_ITEM_WRONG_RESTAURANT
        );
      }

      // Check item availability
      if (!dbItem.available) {
        throw new ApiError(
          400,
          `Menu item "${dbItem.name}" is currently unavailable`,
          ERROR_CODES.MENU_ITEM_UNAVAILABLE
        );
      }

      // 5. Server-side price calculation in integer paise
      const itemSubtotal = calculateItemSubtotal(dbItem.price, quantity);

      orderItemsSnapshot.push({
        menuItemId: dbItem._id,
        itemNameSnapshot: dbItem.name,
        unitPrice: dbItem.price,
        quantity,
        subtotal: itemSubtotal
      });
    }

    // 6. Calculate total financials in integer paise
    const subtotal = calculateOrderSubtotal(orderItemsSnapshot);
    const deliveryFee = calculateDeliveryFee({ restaurant, deliveryAddress, subtotal });
    const totalAmount = subtotal + deliveryFee;

    // 7. Persist order with initial PLACED status
    const orderData = {
      customerId,
      restaurantId,
      driverId: null,
      items: orderItemsSnapshot,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      status: ORDER_STATUS.PLACED
    };

    return await orderRepository.create(orderData);
  }

  /**
   * Retrieves order by ID
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async getOrderById(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(404, `Order with ID ${orderId} not found`, ERROR_CODES.ORDER_NOT_FOUND);
    }
    return order;
  }

  /**
   * Lists orders with pagination, filtering, and sorting
   * @param {object} query
   * @returns {Promise<object>}
   */
  async listOrders(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Filter building
    const filter = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.customerId) {
      filter.customerId = query.customerId;
    }
    if (query.restaurantId) {
      filter.restaurantId = query.restaurantId;
    }
    if (query.driverId) {
      filter.driverId = query.driverId;
    }

    // Whitelisted sorting
    const requestedSortBy = query.sortBy || 'createdAt';
    const sortBy = ALLOWED_ORDER_SORT_FIELDS.includes(requestedSortBy) ? requestedSortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [items, totalItems] = await Promise.all([
      orderRepository.findPaginated({ filter, skip, limit, sort }),
      orderRepository.count(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
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
   * Updates order status strictly enforcing the centralized state machine
   * @param {string} orderId
   * @param {string} nextStatus
   * @returns {Promise<object>}
   */
  async updateOrderStatus(orderId, nextStatus) {
    const order = await orderRepository.findRawById(orderId);
    if (!order) {
      throw new ApiError(404, `Order with ID ${orderId} not found`, ERROR_CODES.ORDER_NOT_FOUND);
    }

    const currentStatus = order.status;

    // State machine enforcement
    if (!isValidOrderTransition(currentStatus, nextStatus)) {
      throw new ApiError(
        409,
        `Order cannot transition from ${currentStatus} to ${nextStatus}`,
        ERROR_CODES.ORDER_INVALID_TRANSITION
      );
    }

    // Atomic update conditioned on currentStatus to prevent concurrent state races
    const updatedOrder = await orderRepository.updateStatus(orderId, currentStatus, nextStatus);
    if (!updatedOrder) {
      const latestOrder = await orderRepository.findRawById(orderId);
      const latestStatus = latestOrder ? latestOrder.status : 'UNKNOWN';
      throw new ApiError(
        409,
        `Order cannot transition from ${latestStatus} to ${nextStatus}`,
        ERROR_CODES.ORDER_INVALID_TRANSITION
      );
    }

    return updatedOrder;
  }

  /**
   * Driver assignment integration point for Role 5
   * Atomically verifies status is READY, assigns driverId, and transitions to DRIVER_ASSIGNED
   * Prevents concurrent double assignment
   * @param {string} orderId
   * @param {string} driverId
   * @returns {Promise<object>}
   */
  async assignDriver(orderId, driverId) {
    if (!driverId || typeof driverId !== 'string' || !driverId.trim()) {
      throw new ApiError(400, 'driverId is required to assign a driver', ERROR_CODES.VALIDATION_ERROR);
    }

    const trimmedDriverId = driverId.trim();

    // Atomic conditional update on status === READY
    const updatedOrder = await orderRepository.assignDriver(
      orderId,
      trimmedDriverId,
      ORDER_STATUS.DRIVER_ASSIGNED
    );

    if (!updatedOrder) {
      const existingOrder = await orderRepository.findRawById(orderId);
      if (!existingOrder) {
        throw new ApiError(404, `Order with ID ${orderId} not found`, ERROR_CODES.ORDER_NOT_FOUND);
      }

      throw new ApiError(
        409,
        `Cannot assign driver: Order status must be READY, but is currently ${existingOrder.status}`,
        ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      );
    }

    return updatedOrder;
  }

  /**
   * Retrieves restaurant orders with pagination and filtering
   * @param {string} restaurantId
   * @param {object} query
   * @returns {Promise<object>}
   */
  async getRestaurantOrders(restaurantId, query = {}) {
    const restaurant = await menuRepository.findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', ERROR_CODES.RESTAURANT_NOT_FOUND);
    }

    return await this.listOrders({
      ...query,
      restaurantId
    });
  }
}

module.exports = new OrderService();
