const request = require('supertest');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../setup');
const app = require('../../src/app');
const Restaurant = require('../../src/models/Restaurant');
const MenuItem = require('../../src/models/MenuItem');
const { ERROR_CODES } = require('../../src/utils/errorCodes');

describe('Menu API (Integration Tests)', () => {
  let restaurant;
  let item1, item2, item3, itemUnavailable;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    restaurant = await Restaurant.create({
      name: 'Luigi Italian Trattoria',
      description: 'Pasta and Pizza specialists',
      address: '77 CMH Road, Indiranagar, Bangalore',
      latitude: 12.98,
      longitude: 77.64,
      active: true
    });

    item1 = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Margherita Pizza',
      description: 'Cheesy classic pizza with basil',
      category: 'Pizza',
      price: 30000, // ₹300.00
      available: true
    });

    item2 = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Farmhouse Veggie Pizza',
      description: 'Bell peppers, onions, mushrooms and mozzarella',
      category: 'Pizza',
      price: 38000, // ₹380.00
      available: true
    });

    item3 = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Spaghetti Aglio Olio',
      description: 'Garlic and olive oil pasta',
      category: 'Pasta',
      price: 26000, // ₹260.00
      available: true
    });

    itemUnavailable = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Truffle Risotto',
      description: 'Seasonal winter risotto',
      category: 'Pasta',
      price: 52000, // ₹520.00
      available: false
    });
  });

  describe('GET /api/restaurants/:restaurantId/menu', () => {
    test('retrieves all items with pagination metadata', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}/menu?page=1&limit=2`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.totalItems).toBe(4);
      expect(res.body.data.pagination.totalPages).toBe(2);
      expect(res.body.data.restaurant.name).toBe('Luigi Italian Trattoria');
    });

    test('filters menu by category', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}/menu?category=Pasta`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      res.body.data.items.forEach((item) => {
        expect(item.category).toBe('Pasta');
      });
    });

    test('filters menu by availability (available=true)', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}/menu?available=true`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(3);
      res.body.data.items.forEach((item) => {
        expect(item.available).toBe(true);
      });
    });

    test('searches menu items by text query', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}/menu?search=garlic`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe('Spaghetti Aglio Olio');
    });

    test('sorts menu items by price ascending', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}/menu?sortBy=price&sortOrder=asc`)
        .expect(200);

      const prices = res.body.data.items.map((i) => i.price);
      expect(prices).toEqual([26000, 30000, 38000, 52000]);
    });

    test('returns 404 for non-existent restaurant', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/restaurants/${fakeId}/menu`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.RESTAURANT_NOT_FOUND);
    });
  });

  describe('GET /api/menu/:id', () => {
    test('retrieves single menu item with populated restaurant details', async () => {
      const res = await request(app)
        .get(`/api/menu/${item1._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Margherita Pizza');
      expect(res.body.data.price).toBe(30000);
      expect(res.body.data.restaurantId.name).toBe('Luigi Italian Trattoria');
    });

    test('returns 404 for non-existent menu item ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/menu/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe(ERROR_CODES.MENU_ITEM_NOT_FOUND);
    });
  });
});
