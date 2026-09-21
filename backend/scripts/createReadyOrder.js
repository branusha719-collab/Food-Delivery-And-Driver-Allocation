require('dotenv').config();

const mongoose = require('mongoose');

const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');

const Order = require('../src/models/Order');
const { ORDER_STATUS } = require('../src/utils/orderStatus');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/food_delivery';

async function createReadyOrder() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

    // Find an active restaurant.
    const restaurant = await Restaurant.findOne({
      active: true
    });

    if (!restaurant) {
      throw new Error(
        'No active restaurant found. Make sure the database is seeded.'
      );
    }

    console.log(
      `Restaurant: ${restaurant.name}`
    );

    // Find an available menu item belonging to that restaurant.
    const menuItem = await MenuItem.findOne({
      restaurantId: restaurant._id,
      available: true
    });

    if (!menuItem) {
      throw new Error(
        'No available menu item found for the restaurant.'
      );
    }

    console.log(
      `Menu item: ${menuItem.name}`
    );

    const quantity = 1;
    const itemSubtotal =
      menuItem.price * quantity;

    const deliveryFee = 4000;
    const subtotal = itemSubtotal;
    const totalAmount =
      subtotal + deliveryFee;

    const order = await Order.create({
      customerId: 'role5-test-customer',

      restaurantId: restaurant._id,

      deliveryAddress:
        'Test Delivery Address, Bangalore',

      items: [
        {
          menuItemId: menuItem._id,
          itemNameSnapshot: menuItem.name,
          unitPrice: menuItem.price,
          quantity,
          subtotal: itemSubtotal
        }
      ],

      subtotal,
      deliveryFee,
      totalAmount,

      // Important: directly create it as READY
      // so we can test Role 5.
      status: ORDER_STATUS.READY
    });

    console.log('\n==========================================');
    console.log('READY ORDER CREATED');
    console.log('==========================================');

    console.log(`Order ID: ${order._id}`);
    console.log(`Restaurant: ${restaurant.name}`);
    console.log(`Menu Item: ${menuItem.name}`);
    console.log(`Status: ${order.status}`);

    console.log('\nUse this order ID for the API test:');
    console.log(order._id.toString());

    console.log('==========================================\n');
  } catch (error) {
    console.error(
      'Failed to create READY order:'
    );
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createReadyOrder();