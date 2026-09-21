const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./src/models/Order');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find({ status: { $in: ['DRIVER_ASSIGNED', 'PICKED_UP'] } });
  console.log(orders.map(o => ({id: o._id, driverId: o.driverId, status: o.status})));
  process.exit(0);
});
