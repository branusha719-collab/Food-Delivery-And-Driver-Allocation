require("dotenv").config();

const { connectDB, disconnectDB } = require("../src/config/db");
const User = require("../src/models/User");
const Restaurant = require("../src/models/Restaurant");
const MenuItem = require("../src/models/MenuItem");
const Order = require("../src/models/Order");
const orderService = require("../src/services/orderService");
const { ORDER_STATUS } = require("../src/utils/orderStatus");

const createTestDelivery = async () => {
  try {
    await connectDB();

    const driver = await User.findOne({
      email: "driver@test.com",
      role: "driver",
    });

    if (!driver) {
      throw new Error("Test driver not found.");
    }

    await User.updateOne(
      { _id: driver._id },
      {
        isOnline: true,
        currentWorkload: 0,
      }
    );

    const restaurant = await Restaurant.findOne({
      active: true,
    });

    if (!restaurant) {
      throw new Error("No active restaurant found. Run npm run seed first.");
    }

    const menuItem = await MenuItem.findOne({
      restaurantId: restaurant._id,
      available: true,
    });

    if (!menuItem) {
      throw new Error("No available menu item found.");
    }

    const quantity = 1;
    const subtotal = menuItem.price;
    const deliveryFee = 4000;
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      customerId: "TEST_CUSTOMER_001",
      restaurantId: restaurant._id,
      driverId: null,
      items: [
        {
          menuItemId: menuItem._id,
          itemNameSnapshot: menuItem.name,
          unitPrice: menuItem.price,
          quantity,
          subtotal,
        },
      ],
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress: "742 Evergreen Terrace",
      status: ORDER_STATUS.READY,
    });

    const assignedOrder = await orderService.assignDriver(
      order._id.toString(),
      driver._id.toString()
    );

    console.log("\n==========================================");
    console.log("TEST DELIVERY CREATED");
    console.log("==========================================");
    console.log("Order ID:", assignedOrder._id);
    console.log("Restaurant:", restaurant.name);
    console.log("Item:", menuItem.name);
    console.log("Driver:", driver.name);
    console.log("Driver ID:", driver._id);
    console.log("Status:", assignedOrder.status);
    console.log("Address:", assignedOrder.deliveryAddress);
    console.log(
      "Total: ₹" + (assignedOrder.totalAmount / 100).toFixed(2)
    );
    console.log("==========================================\n");

    await disconnectDB();
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    await disconnectDB();
    process.exit(1);
  }
};

createTestDelivery();