const mongoose = require('mongoose');
require('dotenv').config();

const bcrypt = require('bcryptjs');

const seedRestaurantUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // We just insert directly into the users collection using the model if it exists, or manually.
    // Let's use the mongoose connection directly to avoid model issues if the model isn't handy.
    
    const db = mongoose.connection.db;
    
    // Find an existing restaurant to link
    const restaurant = await db.collection('restaurants').findOne();
    if (!restaurant) {
      console.log('No restaurants found. Please run npm run seed first.');
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = {
      name: 'Test Restaurant Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: 'restaurant',
      restaurantId: restaurant._id, // Dashboard expects this
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // check if user exists
    const existing = await db.collection('users').findOne({ email: 'owner@example.com' });
    if (existing) {
      console.log('User already exists! Deleting...');
      await db.collection('users').deleteOne({ email: 'owner@example.com' });
    }

    await db.collection('users').insertOne(user);
    console.log(`✅ Created test restaurant owner:
    Email: owner@example.com
    Password: password123
    Linked Restaurant: ${restaurant.name}
    `);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedRestaurantUser();
