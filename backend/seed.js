/**
 * Database Seed Script
 * Populates MongoDB with sample restaurants, menu items, and drivers
 * Run: node seed.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');
const Driver = require('./src/models/Driver');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Driver.deleteMany({});
    console.log('Cleared existing data');

    // --- Restaurants ---
    const restaurants = await Restaurant.insertMany([
      {
        name: 'The Golden Dragon',
        description: 'Authentic Pan-Asian cuisine with a modern twist',
        address: '123 Main Street, Downtown',
        latitude: 12.9716,
        longitude: 77.5946,
        active: true
      },
      {
        name: 'Bella Napoli',
        description: 'Wood-fired pizzas and handmade pasta from Naples',
        address: '456 Oak Avenue, Midtown',
        latitude: 12.9352,
        longitude: 77.6245,
        active: true
      },
      {
        name: 'Sushi Artisan',
        description: 'Premium omakase and sushi rolls by master chefs',
        address: '789 Cherry Lane, Uptown',
        latitude: 12.9698,
        longitude: 77.7500,
        active: true
      },
      {
        name: 'The Burger Co.',
        description: 'Gourmet craft burgers with premium cuts',
        address: '321 Elm Street, West End',
        latitude: 12.9500,
        longitude: 77.5600,
        active: true
      },
      {
        name: 'Green Bowl Kitchen',
        description: 'Healthy bowls, salads, and smoothies',
        address: '555 Park Road, Health District',
        latitude: 12.9800,
        longitude: 77.6100,
        active: true
      }
    ]);
    console.log(`Inserted ${restaurants.length} restaurants`);

    // --- Menu Items ---
    const menuItems = [];

    // The Golden Dragon menu
    menuItems.push(
      { restaurantId: restaurants[0]._id, name: 'Kung Pao Chicken', description: 'Spicy diced chicken with peanuts and chili peppers', category: 'Mains', price: 32000, available: true },
      { restaurantId: restaurants[0]._id, name: 'Dim Sum Platter', description: 'Assorted steamed and fried dumplings', category: 'Appetizers', price: 28000, available: true },
      { restaurantId: restaurants[0]._id, name: 'Pad Thai', description: 'Classic Thai stir-fried noodles with shrimp', category: 'Mains', price: 26000, available: true },
      { restaurantId: restaurants[0]._id, name: 'Mango Sticky Rice', description: 'Traditional Thai dessert with coconut cream', category: 'Desserts', price: 18000, available: true }
    );

    // Bella Napoli menu
    menuItems.push(
      { restaurantId: restaurants[1]._id, name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil', category: 'Pizza', price: 24000, available: true },
      { restaurantId: restaurants[1]._id, name: 'Truffle Pasta', description: 'Fresh tagliatelle with black truffle cream sauce', category: 'Pasta', price: 38000, available: true },
      { restaurantId: restaurants[1]._id, name: 'Bruschetta Classica', description: 'Toasted bread with fresh tomatoes and basil', category: 'Appetizers', price: 16000, available: true },
      { restaurantId: restaurants[1]._id, name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', category: 'Desserts', price: 20000, available: true }
    );

    // Sushi Artisan menu
    menuItems.push(
      { restaurantId: restaurants[2]._id, name: 'Dragon Roll', description: 'Shrimp tempura, avocado, eel, and tobiko', category: 'Rolls', price: 34000, available: true },
      { restaurantId: restaurants[2]._id, name: 'Salmon Sashimi', description: 'Premium Norwegian salmon, 8 pieces', category: 'Sashimi', price: 42000, available: true },
      { restaurantId: restaurants[2]._id, name: 'Miso Soup', description: 'Traditional dashi broth with tofu and seaweed', category: 'Soups', price: 12000, available: true },
      { restaurantId: restaurants[2]._id, name: 'Matcha Ice Cream', description: 'Creamy Japanese green tea ice cream', category: 'Desserts', price: 14000, available: true }
    );

    // The Burger Co. menu
    menuItems.push(
      { restaurantId: restaurants[3]._id, name: 'Classic Smash Burger', description: 'Double patty, American cheese, special sauce', category: 'Burgers', price: 28000, available: true },
      { restaurantId: restaurants[3]._id, name: 'Truffle Fries', description: 'Hand-cut fries with truffle oil and parmesan', category: 'Sides', price: 16000, available: true },
      { restaurantId: restaurants[3]._id, name: 'BBQ Bacon Burger', description: 'Wagyu beef, smoked bacon, BBQ glaze', category: 'Burgers', price: 36000, available: true },
      { restaurantId: restaurants[3]._id, name: 'Milkshake', description: 'Thick vanilla bean milkshake', category: 'Drinks', price: 14000, available: true }
    );

    // Green Bowl Kitchen menu
    menuItems.push(
      { restaurantId: restaurants[4]._id, name: 'Acai Power Bowl', description: 'Acai, granola, banana, berries, honey', category: 'Bowls', price: 22000, available: true },
      { restaurantId: restaurants[4]._id, name: 'Grilled Chicken Salad', description: 'Mixed greens, grilled chicken, avocado, quinoa', category: 'Salads', price: 26000, available: true },
      { restaurantId: restaurants[4]._id, name: 'Green Detox Smoothie', description: 'Spinach, kale, apple, ginger, lemon', category: 'Smoothies', price: 16000, available: true },
      { restaurantId: restaurants[4]._id, name: 'Protein Buddha Bowl', description: 'Tofu, brown rice, edamame, pickled ginger', category: 'Bowls', price: 28000, available: true }
    );

    await MenuItem.insertMany(menuItems);
    console.log(`Inserted ${menuItems.length} menu items`);

    // --- Drivers ---
    const drivers = await Driver.insertMany([
      {
        driverId: 'DRV001',
        name: 'Rahul Kumar',
        available: true,
        activeOrders: 0,
        rating: 4.8,
        vehicleType: 'BIKE',
        location: { latitude: 12.9716, longitude: 77.5946 }
      },
      {
        driverId: 'DRV002',
        name: 'Priya Sharma',
        available: true,
        activeOrders: 1,
        rating: 4.9,
        vehicleType: 'SCOOTER',
        location: { latitude: 12.9400, longitude: 77.6200 }
      },
      {
        driverId: 'DRV003',
        name: 'Amit Patel',
        available: true,
        activeOrders: 0,
        rating: 4.5,
        vehicleType: 'CAR',
        location: { latitude: 12.9600, longitude: 77.5800 }
      },
      {
        driverId: 'DRV004',
        name: 'Neha Gupta',
        available: true,
        activeOrders: 2,
        rating: 4.7,
        vehicleType: 'BIKE',
        location: { latitude: 12.9800, longitude: 77.6000 }
      },
      {
        driverId: 'DRV005',
        name: 'Vikram Singh',
        available: false,
        activeOrders: 3,
        rating: 4.6,
        vehicleType: 'CAR',
        location: { latitude: 12.9550, longitude: 77.6350 }
      }
    ]);
    console.log(`Inserted ${drivers.length} drivers`);

    // Print restaurant IDs for reference
    console.log('\n--- Restaurant IDs for reference ---');
    restaurants.forEach(r => console.log(`  ${r.name}: ${r._id}`));

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
