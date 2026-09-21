const mongoose = require('mongoose');
require('dotenv').config();

const bcrypt = require('bcryptjs');

const seedDriverUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // We will use DRV001 because the driver allocation algorithm strongly prefers it 
    // based on the seeded database locations and ratings.
    const driverId = 'DRV001';
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = {
      name: 'Test Driver User',
      email: 'driver@example.com',
      password: hashedPassword,
      role: 'driver',
      driverId: driverId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const existingUser = await db.collection('users').findOne({ email: 'driver@example.com' });
    if (existingUser) {
      console.log('User already exists! Deleting...');
      await db.collection('users').deleteOne({ email: 'driver@example.com' });
    }

    await db.collection('users').insertOne(user);
    console.log(`✅ Created test driver login:
    Email: driver@example.com
    Password: password123
    Linked Driver Profile ID: ${driverId}
    `);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDriverUser();
