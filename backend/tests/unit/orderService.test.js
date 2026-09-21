const { connectTestDB, clearTestDB, disconnectTestDB } = require('../setup');
const orderService = require('../../src/services/orderService');
const Restaurant = require('../../src/models/Restaurant');
const MenuItem = require('../../src/models/MenuItem');
const Order = require('../../src/models/Order');
const { ORDER_STATUS } = require('../../src/utils/orderStatus');
const { ERROR_CODES } = require('../../src/utils/errorCodes');

describe('OrderService (Unit & Business Rule Tests)', () => {
  let testRestaurant;
  let inactiveRestaurant;
  let testItem1;
  let testItem2;
  let unavailableItem;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    testRestaurant = await Restaurant.create({
      name: 'Test Bistro',
      description: 'Test Description',
      address: '123 Main St, Bangalore',
      latitude: 12.97,
      longitude: 77.59,
      active: true
    });

    inactiveRestaurant = await Restaurant.create({
      name: 'Closed Cafe',
      description: 'Temporarily closed',
      address: '456 Side St, Bangalore',
      latitude: 12.98,
      longitude: 77.60,
      active: false
    });

    testItem1 = await MenuItem.create({
      restaurantId: testRestaurant._id,
      name: 'Margherita Pizza',
      description: 'Classic cheese and tomato',
      category: 'Pizza',
      price: 30000, // ₹300.00
      available: true
    });

    testItem2 = await MenuItem.create({
      restaurantId: testRestaurant._id,
      name: 'Garlic Bread',
      description: 'Crispy garlic bread',
      category: 'Appetizers',
      price: 12000, // ₹120.00
      available: true
    });

    unavailableItem = await MenuItem.create({
      restaurantId: testRestaurant._id,
      name: 'Seasonal Truffle Pasta',
      description: 'Sold out',
      category: 'Pasta',
      price: 45000, // ₹450.00
      available: false
    });
  });

  describe('createOrder()', () => {
    test('successfully calculates itemSubtotal, subtotal, deliveryFee, and totalAmount in paise', async () => {
      const orderData = {
        customerId: 'cust-12345',
        restaurantId: testRestaurant._id.toString(),
        deliveryAddress: 'Flat 402, Sunshine Apts, Bangalore',
        items: [
          { menuItemId: testItem1._id.toString(), quantity: 2 }, // 30000 * 2 = 60000
          { menuItemId: testItem2._id.toString(), quantity: 1 }  // 12000 * 1 = 12000
        ]
      };

      const order = await orderService.createOrder(orderData);

      expect(order).toBeDefined();
      expect(order.status).toBe(ORDER_STATUS.PLACED);
      expect(order.driverId).toBeNull();
      expect(order.items).toHaveLength(2);

      // Verify item snapshots
      expect(order.items[0].itemNameSnapshot).toBe('Margherita Pizza');
      expect(order.items[0].unitPrice).toBe(30000);
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].subtotal).toBe(60000);

      expect(order.items[1].itemNameSnapshot).toBe('Garlic Bread');
      expect(order.items[1].unitPrice).toBe(12000);
      expect(order.items[1].quantity).toBe(1);
      expect(order.items[1].subtotal).toBe(12000);

      // Verify financials (60000 + 12000 = 72000 subtotal, default deliveryFee = 4000)
      expect(order.subtotal).toBe(72000);
      expect(order.deliveryFee).toBe(4000);
      expect(order.totalAmount).toBe(76000);
    });

    test('throws 404 when restaurant does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(
        orderService.createOrder({
          customerId: 'cust-1',
          restaurantId: fakeId,
          deliveryAddress: 'Some address',
          items: [{ menuItemId: testItem1._id.toString(), quantity: 1 }]
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: ERROR_CODES.RESTAURANT_NOT_FOUND
      });
    });

    test('throws 400 when restaurant is inactive', async () => {
      await expect(
        orderService.createOrder({
          customerId: 'cust-1',
          restaurantId: inactiveRestaurant._id.toString(),
          deliveryAddress: 'Some address',
          items: [{ menuItemId: testItem1._id.toString(), quantity: 1 }]
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.RESTAURANT_INACTIVE
      });
    });

    test('throws 404 when a menu item is not found in database', async () => {
      const fakeItemId = '507f1f77bcf86cd799439099';
      await expect(
        orderService.createOrder({
          customerId: 'cust-1',
          restaurantId: testRestaurant._id.toString(),
          deliveryAddress: 'Some address',
          items: [{ menuItemId: fakeItemId, quantity: 1 }]
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: ERROR_CODES.MENU_ITEM_NOT_FOUND
      });
    });

    test('throws 400 when menu item belongs to another restaurant', async () => {
      const otherRestaurant = await Restaurant.create({
        name: 'Another Restaurant',
        address: '789 Other St',
        latitude: 12.95,
        longitude: 77.61,
        active: true
      });

      const otherItem = await MenuItem.create({
        restaurantId: otherRestaurant._id,
        name: 'Other Dish',
        category: 'Appetizers',
        price: 20000,
        available: true
      });

      await expect(
        orderService.createOrder({
          customerId: 'cust-1',
          restaurantId: testRestaurant._id.toString(),
          deliveryAddress: 'Some address',
          items: [{ menuItemId: otherItem._id.toString(), quantity: 1 }]
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.MENU_ITEM_WRONG_RESTAURANT
      });
    });

    test('throws 400 when menu item is marked unavailable', async () => {
      await expect(
        orderService.createOrder({
          customerId: 'cust-1',
          restaurantId: testRestaurant._id.toString(),
          deliveryAddress: 'Some address',
          items: [{ menuItemId: unavailableItem._id.toString(), quantity: 1 }]
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.MENU_ITEM_UNAVAILABLE
      });
    });

    test('throws 400 when quantity is zero or negative', async () => {
      await expect(
        orderService.createOrder({
          customerId: 'cust-1',
          restaurantId: testRestaurant._id.toString(),
          deliveryAddress: 'Some address',
          items: [{ menuItemId: testItem1._id.toString(), quantity: 0 }]
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: ERROR_CODES.INVALID_QUANTITY
      });
    });
  });

  describe('assignDriver() (Role 5 Integration)', () => {
    test('throws 409 when order is not in READY status', async () => {
      const order = await Order.create({
        customerId: 'cust-1',
        restaurantId: testRestaurant._id,
        deliveryAddress: 'Address 1',
        items: [
          {
            menuItemId: testItem1._id,
            itemNameSnapshot: testItem1.name,
            unitPrice: testItem1.price,
            quantity: 1,
            subtotal: testItem1.price
          }
        ],
        subtotal: 30000,
        deliveryFee: 4000,
        totalAmount: 34000,
        status: ORDER_STATUS.PREPARING // Not READY!
      });

      await expect(
        orderService.assignDriver(order._id.toString(), 'driver-999')
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      });
    });

    test('successfully assigns driver when order is in READY status', async () => {
      const order = await Order.create({
        customerId: 'cust-1',
        restaurantId: testRestaurant._id,
        deliveryAddress: 'Address 1',
        items: [
          {
            menuItemId: testItem1._id,
            itemNameSnapshot: testItem1.name,
            unitPrice: testItem1.price,
            quantity: 1,
            subtotal: testItem1.price
          }
        ],
        subtotal: 30000,
        deliveryFee: 4000,
        totalAmount: 34000,
        status: ORDER_STATUS.READY
      });

      const updated = await orderService.assignDriver(order._id.toString(), 'driver-999');

      expect(updated.driverId).toBe('driver-999');
      expect(updated.status).toBe(ORDER_STATUS.DRIVER_ASSIGNED);
    });
  });
});
