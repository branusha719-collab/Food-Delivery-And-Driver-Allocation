const request = require('supertest');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../setup');
const app = require('../../src/app');
const Restaurant = require('../../src/models/Restaurant');
const MenuItem = require('../../src/models/MenuItem');
const { ORDER_STATUS } = require('../../src/utils/orderStatus');
const { ERROR_CODES } = require('../../src/utils/errorCodes');

describe('Orders API (Integration Tests)', () => {
  let restaurant;
  let pizzaItem;
  let pastaItem;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    restaurant = await Restaurant.create({
      name: 'Bella Italia',
      description: 'Authentic Italian',
      address: '100 Indiranagar, Bangalore',
      latitude: 12.97,
      longitude: 77.64,
      active: true
    });

    pizzaItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Margherita Pizza',
      description: 'Classic cheese pizza',
      category: 'Pizza',
      price: 35000, // ₹350.00
      available: true
    });

    pastaItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Penne Arbiata',
      description: 'Spicy pasta',
      category: 'Pasta',
      price: 25000, // ₹250.00
      available: true
    });
  });

  describe('POST /api/orders', () => {
    test('creates order and returns 201 with standard response structure', async () => {
      const payload = {
        customerId: 'customer-101',
        restaurantId: restaurant._id.toString(),
        deliveryAddress: 'Flat 101, Brigade Gateway, Bangalore',
        items: [
          { menuItemId: pizzaItem._id.toString(), quantity: 2 },
          { menuItemId: pastaItem._id.toString(), quantity: 1 }
        ]
      };

      const res = await request(app)
        .post('/api/orders')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order created successfully');
      expect(res.body.errorCode).toBeNull();
      expect(res.body.data).toBeDefined();

      const order = res.body.data;
      expect(order.status).toBe(ORDER_STATUS.PLACED);
      expect(order.driverId).toBeNull();
      expect(order.subtotal).toBe(95000); // (35000 * 2) + (25000 * 1)
      expect(order.deliveryFee).toBe(4000);
      expect(order.totalAmount).toBe(99000);
      expect(order.items).toHaveLength(2);
    });

    test('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customerId: 'cust-1' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
    });
  });

  describe('Order State Transitions: PATCH /api/orders/:id/status', () => {
    let orderId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'customer-202',
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Koramangala, Bangalore',
          items: [{ menuItemId: pizzaItem._id.toString(), quantity: 1 }]
        });
      orderId = res.body.data._id;
    });

    test('executes primary flow: PLACED -> RESTAURANT_ACCEPTED -> PREPARING -> READY -> DRIVER_ASSIGNED -> PICKED_UP -> DELIVERED', async () => {
      // 1. PLACED -> RESTAURANT_ACCEPTED
      let res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.RESTAURANT_ACCEPTED })
        .expect(200);
      expect(res.body.data.status).toBe(ORDER_STATUS.RESTAURANT_ACCEPTED);

      // 2. RESTAURANT_ACCEPTED -> PREPARING
      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.PREPARING })
        .expect(200);
      expect(res.body.data.status).toBe(ORDER_STATUS.PREPARING);

      // 3. PREPARING -> READY
      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.READY })
        .expect(200);
      expect(res.body.data.status).toBe(ORDER_STATUS.READY);

      // 4. READY -> DRIVER_ASSIGNED
      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.DRIVER_ASSIGNED })
        .expect(200);
      expect(res.body.data.status).toBe(ORDER_STATUS.DRIVER_ASSIGNED);

      // 5. DRIVER_ASSIGNED -> PICKED_UP
      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.PICKED_UP })
        .expect(200);
      expect(res.body.data.status).toBe(ORDER_STATUS.PICKED_UP);

      // 6. PICKED_UP -> DELIVERED
      res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.DELIVERED })
        .expect(200);
      expect(res.body.data.status).toBe(ORDER_STATUS.DELIVERED);
    });

    test('executes alternative flow: PLACED -> REJECTED', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.REJECTED })
        .expect(200);

      expect(res.body.data.status).toBe(ORDER_STATUS.REJECTED);
    });

    test('rejects invalid jump: PLACED -> DELIVERED with 409', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.DELIVERED })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.ORDER_INVALID_TRANSITION);
      expect(res.body.message).toContain('Order cannot transition from PLACED to DELIVERED');
    });

    test('rejects invalid transition: DELIVERED cannot transition to PREPARING', async () => {
      // Progress to DELIVERED
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.RESTAURANT_ACCEPTED });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.PREPARING });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.READY });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.DRIVER_ASSIGNED });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.PICKED_UP });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.DELIVERED });

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.PREPARING })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.ORDER_INVALID_TRANSITION);
    });

    test('rejects invalid transition: REJECTED cannot transition to PREPARING', async () => {
      // Reject from PLACED
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.REJECTED });

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: ORDER_STATUS.PREPARING })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.ORDER_INVALID_TRANSITION);
    });
  });

  describe('Role 5 Integration: PATCH /api/orders/:id/assign-driver', () => {
    let orderId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'customer-303',
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'HSR Layout, Bangalore',
          items: [{ menuItemId: pizzaItem._id.toString(), quantity: 1 }]
        });
      orderId = res.body.data._id;
    });

    test('fails with 409 when order is PLACED (not READY)', async () => {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .send({ driverId: 'driver-fast-01' })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.DRIVER_ASSIGNMENT_INVALID);
    });

    test('succeeds when order is READY and transitions to DRIVER_ASSIGNED', async () => {
      // Move order: PLACED -> RESTAURANT_ACCEPTED -> PREPARING -> READY
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.RESTAURANT_ACCEPTED });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.PREPARING });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.READY });

      const res = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .send({ driverId: 'driver-fast-01' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.driverId).toBe('driver-fast-01');
      expect(res.body.data.status).toBe(ORDER_STATUS.DRIVER_ASSIGNED);
    });

    test('prevents double assignment: cannot assign driver when status is already DRIVER_ASSIGNED', async () => {
      // Move order to READY
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.RESTAURANT_ACCEPTED });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.PREPARING });
      await request(app).patch(`/api/orders/${orderId}/status`).send({ status: ORDER_STATUS.READY });

      // First assignment succeeds
      const res1 = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .send({ driverId: 'driver-fast-01' })
        .expect(200);
      expect(res1.body.data.driverId).toBe('driver-fast-01');

      // Second assignment attempt must be rejected atomically with 409
      const res2 = await request(app)
        .patch(`/api/orders/${orderId}/assign-driver`)
        .send({ driverId: 'driver-slow-02' })
        .expect(409);

      expect(res2.body.success).toBe(false);
      expect(res2.body.errorCode).toBe(ERROR_CODES.DRIVER_ASSIGNMENT_INVALID);
      expect(res2.body.message).toContain('Order status must be READY, but is currently DRIVER_ASSIGNED');
    });
  });

  describe('GET /api/orders (Pagination, Filtering, Sorting)', () => {
    beforeEach(async () => {
      // Create 3 orders
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/api/orders')
          .send({
            customerId: `cust-${i}`,
            restaurantId: restaurant._id.toString(),
            deliveryAddress: `Address ${i}`,
            items: [{ menuItemId: pizzaItem._id.toString(), quantity: i }]
          });
      }
    });

    test('returns paginated orders with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=2')
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
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(3);
    });

    test('sorts orders by totalAmount ascending', async () => {
      const res = await request(app)
        .get('/api/orders?sortBy=totalAmount&sortOrder=asc')
        .expect(200);

      const amounts = res.body.data.items.map((o) => o.totalAmount);
      expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
    });

    test('filters orders by customerId', async () => {
      const res = await request(app)
        .get('/api/orders?customerId=cust-1')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      res.body.data.items.forEach((item) => {
        expect(item.customerId).toBe('cust-1');
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    test('returns order details without internal __v', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'customer-details',
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Indiranagar, Bangalore',
          items: [{ menuItemId: pizzaItem._id.toString(), quantity: 1 }]
        });
      const orderId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(orderId);
      expect(res.body.data.__v).toBeUndefined();
    });

    test('returns 404 for non-existent order ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/orders/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.ORDER_NOT_FOUND);
    });

    test('returns 400 for malformed MongoDB ObjectId', async () => {
      const res = await request(app)
        .get('/api/orders/not-a-valid-object-id')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(res.body.message).toContain('Order ID must be a valid MongoDB ObjectId');
    });

    test('returns 400 for invalid status value in status update', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'cust-val-test',
          restaurantId: restaurant._id.toString(),
          deliveryAddress: 'Indiranagar, Bangalore',
          items: [{ menuItemId: pizzaItem._id.toString(), quantity: 1 }]
        });
      const orderId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'NON_EXISTENT_STATUS' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(res.body.message).toContain('status must be one of');
    });
  });
});
