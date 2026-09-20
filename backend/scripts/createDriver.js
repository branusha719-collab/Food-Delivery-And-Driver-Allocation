require('dotenv').config();

const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');

const createDriver = async () => {
  try {
    await connectDB();

    const email = 'driver@test.com';
    const password = 'Driver@123';
    const name = 'Test Driver';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Driver already exists.');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      await disconnectDB();
      return;
    }

    const passwordHash = await hashPassword(password);

    const driver = await User.create({
      name,
      email,
      password: passwordHash,
      role: 'driver'
    });

    console.log('==========================================');
    console.log('DRIVER ACCOUNT CREATED');
    console.log(`Name: ${driver.name}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${driver.role}`);
    console.log(`ID: ${driver._id}`);
    console.log('==========================================');

    await disconnectDB();
  } catch (error) {
    console.error('Failed to create driver:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

createDriver();