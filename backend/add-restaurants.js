const mongoose = require('mongoose');
require('dotenv').config();
const Restaurant = require('./src/models/Restaurant');
const MenuItem = require('./src/models/MenuItem');

const moreRestaurants = [
  {
    name: 'Burger Joint',
    address: '42 Main St, Downtown',
    latitude: 28.614,
    longitude: 77.208,
    active: true
  },
  {
    name: 'Pizza Hut Express',
    address: '77 Elm St',
    latitude: 28.612,
    longitude: 77.210,
    active: true
  },
  {
    name: 'Taco Bell',
    address: '900 Broadway',
    latitude: 28.618,
    longitude: 77.215,
    active: true
  },
  {
    name: 'Sushi Station',
    address: '111 Ocean Ave',
    latitude: 28.611,
    longitude: 77.205,
    active: true
  },
  {
    name: 'Healthy Salads',
    address: '222 Green Rd',
    latitude: 28.616,
    longitude: 77.211,
    active: true
  }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  for (const rData of moreRestaurants) {
    const existing = await Restaurant.findOne({ name: rData.name });
    let rId;
    if (!existing) {
      const rest = await Restaurant.create(rData);
      rId = rest._id;
      console.log(`Created restaurant: ${rData.name}`);
    } else {
      rId = existing._id;
    }
    
    // Add one generic item
    const item = await MenuItem.findOne({ restaurantId: rId });
    if (!item) {
      await MenuItem.create({
        restaurantId: rId,
        name: `${rData.name} Special`,
        description: 'Our signature dish.',
        category: 'Specials',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        available: true
      });
    }
  }
  
  console.log('Finished adding more restaurants!');
  process.exit(0);
});
