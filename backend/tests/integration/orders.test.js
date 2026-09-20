const request = require('supertest');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../setup');
const app = require('../../src/app');
const Restaurant = require('../../src/models/Restaurant');
const MenuItem = require('../../src/models/MenuItem');
const User = require('../../src/models/User');

const { ORDER_STATUS } = require('../../src/utils/orderStatus');
const { ERROR_CODES } = require('../../src/utils/errorCodes');
const { hashPassword } = require('../../src/utils/password');
const { generateToken } = require('../../src/utils/jwt');

describe('Orders API (Integration Tests)', () => {
  let restaurant;
  let pizzaItem;
  let pastaItem;

  let customerUser;
  let secondCustomerUser;
  let driverUser;
  let adminUser;

  let customerToken;
  let secondCustomerToken;
  let driverToken;
  let adminToken;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // ---------------------------------------------------------
    // Create test users
    // ---------------------------------------------------------

    const passwordHash = await hashPassword('TestPassword123');

    customerUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: passwordHash,
      role: 'customer'
    });

    secondCustomerUser = await User.create({
      name: 'Second Customer',
      email: 'customer2@test.com',
      password: passwordHash,
      role: 'customer'
    });

    driverUser = await User.create({
      name: 'Test Driver',
      email: 'driver@test.com',
      password: passwordHash,
      role: 'driver'
    });

    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: passwordHash,
      role: 'admin'
    });

    // ---------------------------------------------------------
    // Generate JWTs
    // ---------------------------------------------------------

    customerToken = generateToken(customerUser);
    secondCustomerToken = generateToken(secondCustomerUser);
    driverToken = generateToken(driverUser);
    adminToken = generateToken(adminUser);

    // ---------------------------------------------------------
    // Create restaurant
    // ---------------------------------------------------------

    restaurant = await Restaurant.create({
      name: 'Bella Italia',
      description: 'Authentic Italian',
      address: '100 Indiranagar, Bangalore',
      latitude: 12.97,
      longitude: 77.64,
      active: true
    });

    // ---------------------------------------------------------
    // Create menu items
    // ---------------------------------------------------------

    pizzaItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Margherita Pizza',
      description: 'Classic cheese pizza',
      category: 'Pizza',
      price: 35000,
      available: true
    });

    pastaItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Penne Arbiata',
      description: 'Spicy pasta',
      category: 'Pasta',
      price: 25000,
      available: true
    });
  });

  // ===========================================================
  // POST /api/orders
  // ===========================================================

  describe('POST /api/orders', () => {
    test('creates order and returns 201 with standard response structure', async () => {
      const payload = {
        restaurantId: restaurant._id.toString(),
        deliveryAddress: 'Flat 101, Brigade Gateway, Bangalore',
        items: [
          {
            menuItemId: pizzaItem._id.toString(),
            quantity: 2
          },
          {
            menuItemId: pastaItem._id.toString(),
            quantity: 1
          }
        ]
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order created successfully');
      expect(res.body.errorCode).toBeNull();
      expect(res.body.data).toBeDefined();

      const order = res.body.data;

      expect(order.status).toBe(ORDER_STATUS.PLACED);
      expect(order.driverId).toBeNull();
      expect(order.customerId).toBe(customerUser._id.toString());
      expect(order.subtotal).toBe(95000);
      expect(order.deliveryFee).toBe(4000);
      expect(order.totalAmount).toBe(99000);
      expect(order.items).toHaveLength(2);
    });

    test('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    test('rejects unauthenticated order creation', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Bangalore',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('customer cannot impersonate another customer through customerId', async () => {
      const payload = {
        customerId: secondCustomerUser._id.toString(),
        restaurantId: restaurant._id.toString(),
        deliveryAddress: 'Bangalore',
        items: [
          {
            menuItemId: pizzaItem._id.toString(),
            quantity: 1
          }
        ]
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.data.customerId).toBe(
        customerUser._id.toString()
      );

      expect(res.body.data.customerId).not.toBe(
        secondCustomerUser._id.toString()
      );
    });
  });

  // ===========================================================
  // PATCH /api/orders/:id/status
  // ===========================================================

  describe('Order State Transitions: PATCH /api/orders/:id/status', () => {
    let orderId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Koramangala, Bangalore',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(201);

      orderId = res.body.data._id;
    });

    test('executes primary flow: PLACED -> RESTAURANT_ACCEPTED -> PREPARING -> READY -> DRIVER_ASSIGNED -> PICKED_UP -> DELIVERED', async () => {
      let res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.RESTAURANT_ACCEPTED
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.RESTAURANT_ACCEPTED
      );

      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.PREPARING
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.PREPARING
      );

      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.READY
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.READY
      );

      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.DRIVER_ASSIGNED
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.DRIVER_ASSIGNED
      );

      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.PICKED_UP
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.PICKED_UP
      );

      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.DELIVERED
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.DELIVERED
      );
    });

    test('executes alternative flow: PLACED -> REJECTED', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.REJECTED
        })
        .expect(200);

      expect(res.body.data.status).toBe(
        ORDER_STATUS.REJECTED
      );
    });

    test('rejects invalid jump: PLACED -> DELIVERED with 409', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.DELIVERED
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.ORDER_INVALID_TRANSITION
      );

      expect(res.body.message).toContain(
        'Order cannot transition from PLACED to DELIVERED'
      );
    });

    test('rejects invalid transition: DELIVERED cannot transition to PREPARING', async () => {
      const statuses = [
        ORDER_STATUS.RESTAURANT_ACCEPTED,
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.READY,
        ORDER_STATUS.DRIVER_ASSIGNED,
        ORDER_STATUS.PICKED_UP,
        ORDER_STATUS.DELIVERED
      ];

      for (const status of statuses) {
        await request(app)
          .patch(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${driverToken}`)
          .send({ status })
          .expect(200);
      }

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.PREPARING
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.ORDER_INVALID_TRANSITION
      );
    });

    test('rejects invalid transition: REJECTED cannot transition to PREPARING', async () => {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.REJECTED
        })
        .expect(200);

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.PREPARING
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.ORDER_INVALID_TRANSITION
      );
    });

    test('customer cannot update order status', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          status: ORDER_STATUS.RESTAURANT_ACCEPTED
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================
  // PATCH /api/orders/:id/assign-driver
  // ===========================================================

  describe('Role 5 Integration: PATCH /api/orders/:id/assign-driver', () => {
    let orderId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'HSR Layout, Bangalore',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(201);

      orderId = res.body.data._id;
    });

    test('fails with 409 when order is PLACED (not READY)', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          driverId: 'driver-fast-01'
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      );
    });

    test('succeeds when order is READY and transitions to DRIVER_ASSIGNED', async () => {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.RESTAURANT_ACCEPTED
        })
        .expect(200);

      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.PREPARING
        })
        .expect(200);

      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.READY
        })
        .expect(200);

      const res = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          driverId: 'driver-fast-01'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.driverId).toBe('driver-fast-01');
      expect(res.body.data.status).toBe(
        ORDER_STATUS.DRIVER_ASSIGNED
      );
    });

    test('prevents double assignment: cannot assign driver when status is already DRIVER_ASSIGNED', async () => {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.RESTAURANT_ACCEPTED
        })
        .expect(200);

      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.PREPARING
        })
        .expect(200);

      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: ORDER_STATUS.READY
        })
        .expect(200);

      const res1 = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          driverId: 'driver-fast-01'
        })
        .expect(200);

      expect(res1.body.data.driverId).toBe(
        'driver-fast-01'
      );

      const res2 = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          driverId: 'driver-slow-02'
        })
        .expect(409);

      expect(res2.body.success).toBe(false);
      expect(res2.body.errorCode).toBe(
        ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      );

      expect(res2.body.message).toContain(
        'Order status must be READY, but is currently DRIVER_ASSIGNED'
      );
    });

    test('customer cannot assign a driver', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          driverId: 'driver-fast-01'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================
  // GET /api/orders
  // ===========================================================

  describe('GET /api/orders (Pagination, Filtering, Sorting)', () => {
    beforeEach(async () => {
      // Create orders belonging to the authenticated customer.
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            restaurantId: restaurant._id.toString(),
            deliveryAddress: `Address ${i}`,
            items: [
              {
                menuItemId: pizzaItem._id.toString(),
                quantity: i
              }
            ]
          })
          .expect(201);
      }
    });

    test('returns paginated orders with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=2')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);

      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 2,
        totalItems: 3,
        totalPages: 2
      });
    });

    test('filters orders by status', async () => {
      const res = await request(app)
        .get('/api/orders?status=PLACED')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(3);
    });

    test('sorts orders by totalAmount ascending', async () => {
      const res = await request(app)
        .get('/api/orders?sortBy=totalAmount&sortOrder=asc')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      const amounts = res.body.data.items.map(
        (order) => order.totalAmount
      );

      expect(amounts).toEqual(
        [...amounts].sort((a, b) => a - b)
      );
    });

    test('customer can only see their own orders even when another customerId is supplied', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${secondCustomerToken}`)
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Second Customer Address',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(201);

      const res = await request(app)
        .get(
          `/api/orders?customerId=${secondCustomerUser._id.toString()}`
        )
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      res.body.data.items.forEach((item) => {
        expect(item.customerId).toBe(
          customerUser._id.toString()
        );
      });
    });

    test('unauthenticated users cannot list orders', async () => {
      await request(app)
        .get('/api/orders')
        .expect(401);
    });
  });

  // ===========================================================
  // GET /api/orders/:id
  // ===========================================================

  describe('GET /api/orders/:id', () => {
    test('returns order details without internal __v', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Indiranagar, Bangalore',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(201);

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(orderId);
      expect(res.body.data.__v).toBeUndefined();
    });

    test('returns 404 for non-existent order ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.ORDER_NOT_FOUND
      );
    });

    test('returns 400 for malformed MongoDB ObjectId', async () => {
      const res = await request(app)
        .get('/api/orders/not-a-valid-object-id')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.VALIDATION_ERROR
      );

      expect(res.body.message).toContain(
        'Order ID must be a valid MongoDB ObjectId'
      );
    });

    test('returns 400 for invalid status value in status update', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Indiranagar, Bangalore',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(201);

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          status: 'NON_EXISTENT_STATUS'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.VALIDATION_ERROR
      );

      expect(res.body.message).toContain(
        'status must be one of'
      );
    });

    test('customer cannot access another customer order', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${secondCustomerToken}`)
        .send({
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Second Customer Address',
          items: [
            {
              menuItemId: pizzaItem._id.toString(),
              quantity: 1
            }
          ]
        })
        .expect(201);

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(
        ERROR_CODES.FORBIDDEN
      );
    });
  });
});