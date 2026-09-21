const {
  connectTestDB,
  clearTestDB,
  disconnectTestDB
} = require('../setup');

const driverAllocationService = require('../../src/services/driverAllocationService');

const Restaurant = require('../../src/models/Restaurant');
const MenuItem = require('../../src/models/MenuItem');
const Order = require('../../src/models/Order');
const Driver = require('../../src/models/Driver');

const { ORDER_STATUS } = require('../../src/utils/orderStatus');
const { ERROR_CODES } = require('../../src/utils/errorCodes');

describe('DriverAllocationService (Role 5)', () => {
  let testRestaurant;
  let testItem;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    /*
     * Restaurant location:
     * Bangalore
     */
    testRestaurant = await Restaurant.create({
      name: 'Driver Allocation Restaurant',
      description: 'Role 5 Test Restaurant',
      address: 'Bangalore',
      latitude: 12.9700,
      longitude: 77.5900,
      active: true
    });

    testItem = await MenuItem.create({
      restaurantId: testRestaurant._id,
      name: 'Test Pizza',
      description: 'Test pizza',
      category: 'Pizza',
      price: 30000,
      available: true
    });
  });

  async function createReadyOrder() {
    return await Order.create({
      customerId: 'customer-role5',
      restaurantId: testRestaurant._id,
      deliveryAddress: 'Bangalore',
      items: [
        {
          menuItemId: testItem._id,
          itemNameSnapshot: testItem.name,
          unitPrice: testItem.price,
          quantity: 1,
          subtotal: testItem.price
        }
      ],
      subtotal: 30000,
      deliveryFee: 4000,
      totalAmount: 34000,
      status: ORDER_STATUS.READY
    });
  }

  describe('calculateDistance()', () => {
    test('returns approximately zero for identical coordinates', () => {
      const distance =
        driverAllocationService.calculateDistance(
          12.97,
          77.59,
          12.97,
          77.59
        );

      expect(distance).toBeCloseTo(0, 5);
    });

    test('calculates a positive distance between two locations', () => {
      const distance =
        driverAllocationService.calculateDistance(
          12.97,
          77.59,
          12.98,
          77.60
        );

      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('driver availability', () => {
    test('ignores unavailable drivers', async () => {
      const order = await createReadyOrder();

      await Driver.create({
        driverId: 'unavailable-driver',
        name: 'Unavailable Driver',
        available: false,
        activeOrders: 0,
        rating: 5,
        vehicleType: 'BIKE',
        location: {
          latitude: 12.9701,
          longitude: 77.5901
        }
      });

      await Driver.create({
        driverId: 'available-driver',
        name: 'Available Driver',
        available: true,
        activeOrders: 1,
        rating: 4,
        vehicleType: 'BIKE',
        location: {
          latitude: 12.9800,
          longitude: 77.6000
        }
      });

      const result =
        await driverAllocationService.selectBestDriver(
          order._id.toString()
        );

      expect(
        result.selected.driver.driverId
      ).toBe('available-driver');

      expect(
        result.candidates.some(
          (candidate) =>
            candidate.driver.driverId ===
            'unavailable-driver'
        )
      ).toBe(false);
    });
  });

  describe('distance-based selection', () => {
    test('considers driver distance when ranking drivers', async () => {
      const order = await createReadyOrder();

      await Driver.create([
        {
          driverId: 'near-driver',
          name: 'Near Driver',
          available: true,
          activeOrders: 0,
          rating: 5,
          vehicleType: 'BIKE',
          location: {
            latitude: 12.9705,
            longitude: 77.5905
          }
        },
        {
          driverId: 'far-driver',
          name: 'Far Driver',
          available: true,
          activeOrders: 0,
          rating: 5,
          vehicleType: 'BIKE',
          location: {
            latitude: 13.0500,
            longitude: 77.7000
          }
        }
      ]);

      const result =
        await driverAllocationService.selectBestDriver(
          order._id.toString()
        );

      expect(
        result.selected.driver.driverId
      ).toBe('near-driver');

      expect(
        result.selected.distanceKm
      ).toBeLessThan(
        result.candidates.find(
          (candidate) =>
            candidate.driver.driverId === 'far-driver'
        ).distanceKm
      );
    });
  });

  describe('workload-based selection', () => {
    test('prefers a lower workload when other factors are similar', async () => {
      const order = await createReadyOrder();

      await Driver.create([
        {
          driverId: 'low-workload',
          name: 'Low Workload',
          available: true,
          activeOrders: 0,
          rating: 5,
          vehicleType: 'BIKE',
          location: {
            latitude: 12.9710,
            longitude: 77.5910
          }
        },
        {
          driverId: 'high-workload',
          name: 'High Workload',
          available: true,
          activeOrders: 5,
          rating: 5,
          vehicleType: 'BIKE',
          location: {
            latitude: 12.9710,
            longitude: 77.5910
          }
        }
      ]);

      const result =
        await driverAllocationService.selectBestDriver(
          order._id.toString()
        );

      expect(
        result.selected.driver.driverId
      ).toBe('low-workload');
    });
  });

  describe('rating-based selection', () => {
    test('considers driver rating during ranking', async () => {
      const order = await createReadyOrder();

      await Driver.create([
        {
          driverId: 'high-rating',
          name: 'High Rating',
          available: true,
          activeOrders: 0,
          rating: 5,
          vehicleType: 'BIKE',
          location: {
            latitude: 12.9710,
            longitude: 77.5910
          }
        },
        {
          driverId: 'low-rating',
          name: 'Low Rating',
          available: true,
          activeOrders: 0,
          rating: 2,
          vehicleType: 'BIKE',
          location: {
            latitude: 12.9710,
            longitude: 77.5910
          }
        }
      ]);

      const result =
        await driverAllocationService.selectBestDriver(
          order._id.toString()
        );

      expect(
        result.selected.driver.driverId
      ).toBe('high-rating');
    });
  });

  describe('vehicle compatibility', () => {
    test('selects a matching vehicle type', async () => {
      const order = await createReadyOrder();

      await Driver.create([
        {
          driverId: 'bike-driver',
          name: 'Bike Driver',
          available: true,
          activeOrders: 0,
          rating: 5,
          vehicleType: 'BIKE',
          location: {
            latitude: 12.9710,
            longitude: 77.5910
          }
        },
        {
          driverId: 'car-driver',
          name: 'Car Driver',
          available: true,
          activeOrders: 0,
          rating: 5,
          vehicleType: 'CAR',
          location: {
            latitude: 12.9710,
            longitude: 77.5910
          }
        }
      ]);

      const result =
        await driverAllocationService.selectBestDriver(
          order._id.toString(),
          'BIKE'
        );

      expect(
        result.selected.driver.driverId
      ).toBe('bike-driver');

      expect(
        result.candidates.every(
          (candidate) =>
            candidate.driver.vehicleType === 'BIKE'
        )
      ).toBe(true);
    });

    test('throws when no driver matches the required vehicle', async () => {
      const order = await createReadyOrder();

      await Driver.create({
        driverId: 'car-only',
        name: 'Car Driver',
        available: true,
        activeOrders: 0,
        rating: 5,
        vehicleType: 'CAR',
        location: {
          latitude: 12.9710,
          longitude: 77.5910
        }
      });

      await expect(
        driverAllocationService.selectBestDriver(
          order._id.toString(),
          'BIKE'
        )
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode:
          ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      });
    });
  });

  describe('order validation', () => {
    test('rejects an order that is not READY', async () => {
      const order = await Order.create({
        customerId: 'customer-role5',
        restaurantId: testRestaurant._id,
        deliveryAddress: 'Bangalore',
        items: [
          {
            menuItemId: testItem._id,
            itemNameSnapshot: testItem.name,
            unitPrice: testItem.price,
            quantity: 1,
            subtotal: testItem.price
          }
        ],
        subtotal: 30000,
        deliveryFee: 4000,
        totalAmount: 34000,
        status: ORDER_STATUS.PREPARING
      });

      await expect(
        driverAllocationService.selectBestDriver(
          order._id.toString()
        )
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode:
          ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      });
    });

    test('throws when no drivers are available', async () => {
      const order = await createReadyOrder();

      await expect(
        driverAllocationService.selectBestDriver(
          order._id.toString()
        )
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode:
          ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
      });
    });
  });

  describe('allocateDriver()', () => {
    test('selects and assigns a driver successfully', async () => {
      const order = await createReadyOrder();

      await Driver.create({
        driverId: 'best-driver',
        name: 'Best Driver',
        available: true,
        activeOrders: 0,
        rating: 5,
        vehicleType: 'BIKE',
        location: {
          latitude: 12.9705,
          longitude: 77.5905
        }
      });

      const result =
        await driverAllocationService.allocateDriver(
          order._id.toString()
        );

      expect(result.selectedDriver).toBeDefined();

      expect(
        result.selectedDriver.driverId
      ).toBe('best-driver');

      expect(
        result.order.driverId
      ).toBe('best-driver');

      expect(
        result.order.status
      ).toBe(ORDER_STATUS.DRIVER_ASSIGNED);

      expect(result.ranking).toHaveLength(1);
    });
  });
});