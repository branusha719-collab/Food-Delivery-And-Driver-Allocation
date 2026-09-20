require('dotenv').config();

const mongoose = require('mongoose');
const Driver = require('../src/models/Driver');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/food_delivery';

const drivers = [
  {
    driverId: 'driver-arjun-01',
    name: 'Arjun',
    available: true,
    activeOrders: 0,
    rating: 4.8,
    vehicleType: 'BIKE',
    location: {
      latitude: 12.9780,
      longitude: 77.6400
    }
  },

  {
    driverId: 'driver-rahul-02',
    name: 'Rahul',
    available: true,
    activeOrders: 2,
    rating: 4.5,
    vehicleType: 'BIKE',
    location: {
      latitude: 12.9850,
      longitude: 77.6500
    }
  },

  {
    driverId: 'driver-priya-03',
    name: 'Priya',
    available: true,
    activeOrders: 1,
    rating: 4.9,
    vehicleType: 'SCOOTER',
    location: {
      latitude: 12.9700,
      longitude: 77.6300
    }
  },

  {
    driverId: 'driver-kiran-04',
    name: 'Kiran',
    available: false,
    activeOrders: 0,
    rating: 5.0,
    vehicleType: 'CAR',
    location: {
      latitude: 12.9600,
      longitude: 77.6200
    }
  }
];

async function seedDrivers() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected successfully.');

    for (const driver of drivers) {
      await Driver.findOneAndUpdate(
        { driverId: driver.driverId },
        driver,
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      console.log(`✓ Seeded: ${driver.driverId}`);
    }

    console.log('\nAll drivers seeded successfully!');
  } catch (error) {
    console.error('\nDriver seeding failed:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

seedDrivers();