require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');
const MenuItem = require('../src/models/MenuItem');
const Order = require('../src/models/Order');
const { connectDB, disconnectDB } = require('../src/config/db');

const sampleRestaurants = [
  {
    name: 'Spice Symphony',
    description: 'Authentic royal North Indian cuisine, slow-cooked clay oven biryanis and tandoori specialties.',
    address: '102 MG Road, Indiranagar, Bangalore, Karnataka 560038',
    latitude: 12.9784,
    longitude: 77.6408,
    active: true
  },
  {
    name: 'Bella Italia Pizzeria',
    description: 'Wood-fired sourdough artisan pizzas, hand-rolled pastas and authentic Italian desserts.',
    address: '45 80 Feet Road, 4th Block, Koramangala, Bangalore, Karnataka 560034',
    latitude: 12.9345,
    longitude: 77.6265,
    active: true
  },
  {
    name: 'Dragon Wok Kitchen',
    description: 'Fresh Asian street flavors, hand-pulled noodles, spicy dim sums and wok bowls.',
    address: '12 100 Feet Road, HAL 2nd Stage, Bangalore, Karnataka 560008',
    latitude: 12.9698,
    longitude: 77.6499,
    active: true
  }
];

const getMenuItemsForRestaurant = (restaurantName, restaurantId) => {
  if (restaurantName === 'Spice Symphony') {
    return [
      {
        restaurantId,
        name: 'Dum Pukht Chicken Biryani',
        description: 'Fragrant basmati rice layered with spiced tender chicken and saffron, slow-cooked in a sealed clay pot.',
        category: 'Biryani',
        price: 34900, // ₹349.00 in paise
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Paneer Butter Masala',
        description: 'Fresh cottage cheese cubes simmered in a velvety, rich tomato, butter, and cashew gravy.',
        category: 'Curries',
        price: 28900, // ₹289.00
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Butter Garlic Naan',
        description: 'Traditional tandoor baked leavened flatbread brushed generously with melted butter and roasted garlic.',
        category: 'Breads',
        price: 6500, // ₹65.00
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Tandoori Murgh (Half)',
        description: 'Farm-fresh chicken marinated in Kashmiri red chili, yogurt, and aromatic spices charred in clay oven.',
        category: 'Appetizers',
        price: 29900, // ₹299.00
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Dal Makhani',
        description: 'Black lentils slow-cooked overnight with cream, butter, and mild spices.',
        category: 'Curries',
        price: 24900, // ₹249.00
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Gulab Jamun (2 Pcs)',
        description: 'Soft milk-solid dumplings dipped in warm cardamom rose syrup.',
        category: 'Desserts',
        price: 9900, // ₹99.00
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Mutton Galouti Kebab (Seasonal)',
        description: 'Melt-in-mouth minced lamb kebabs smoked with clove and exotic Awadhi spices.',
        category: 'Appetizers',
        price: 38900, // ₹389.00
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
        available: false // unavailable test item
      }
    ];
  }

  if (restaurantName === 'Bella Italia Pizzeria') {
    return [
      {
        restaurantId,
        name: 'Margherita Rustica Pizza (12 inch)',
        description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.',
        category: 'Pizza',
        price: 42900, // ₹429.00
        imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Smoked Pepperoni Pizza (12 inch)',
        description: 'Crispy spicy pepperoni slices, mozzarella, chili flakes, and hot honey drizzle.',
        category: 'Pizza',
        price: 54900, // ₹549.00
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Creamy Truffle Fettuccine',
        description: 'Handmade pasta tossed in black truffle oil, wild mushrooms, and aged Parmigiano Reggiano.',
        category: 'Pasta',
        price: 46900, // ₹469.00
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Crispy Garlic Bread with Mozzarella',
        description: 'Toasted artisan baguette with roasted garlic herb butter and melted mozzarella.',
        category: 'Appetizers',
        price: 18900, // ₹189.00
        imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Classic Tiramisu',
        description: 'Espresso-soaked ladyfingers layered with mascarpone cream and dusted with Dutch cocoa.',
        category: 'Desserts',
        price: 24900, // ₹249.00
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'San Pellegrino Sparkling Blood Orange',
        description: 'Chilled sparkling Italian beverage (330ml).',
        category: 'Beverages',
        price: 15900, // ₹159.00
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
        available: true
      },
      {
        restaurantId,
        name: 'Burrata Bruschetta (Limited)',
        description: 'Creamy burrata over toasted ciabatta with cherry tomato confit and balsamic glaze.',
        category: 'Appetizers',
        price: 34900, // ₹349.00
        imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500',
        available: false // unavailable test item
      }
    ];
  }

  // Dragon Wok Kitchen
  return [
    {
      restaurantId,
      name: 'Chili Garlic Hakka Noodles',
      description: 'Wok-tossed egg noodles with crunchy bell peppers, cabbage, scallions, and red chili garlic sauce.',
      category: 'Noodles',
      price: 24900, // ₹249.00
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
      available: true
    },
    {
      restaurantId,
      name: 'Steamed Chicken Dim Sum (6 Pcs)',
      description: 'Handmade thin wrappers stuffed with juicy minced chicken, ginger, and scallions served with spicy dip.',
      category: 'Appetizers',
      price: 26900, // ₹269.00
      imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
      available: true
    },
    {
      restaurantId,
      name: 'Kung Pao Chicken Bowl',
      description: 'Crispy diced chicken tossed with Sichuan peppercorns, dried chilies, and roasted peanuts over Jasmine rice.',
      category: 'Rice Bowls',
      price: 32900, // ₹329.00
      imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500',
      available: true
    },
    {
      restaurantId,
      name: 'Crispy Honey Chili Lotus Stem',
      description: 'Thin slices of lotus stem crisped and tossed in spicy honey chili sesame glaze.',
      category: 'Appetizers',
      price: 25900, // ₹259.00
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
      available: true
    },
    {
      restaurantId,
      name: 'Thai Green Curry with Jasmine Rice',
      description: 'Fragrant coconut milk curry with bamboo shoots, baby corn, zucchini, and Thai sweet basil.',
      category: 'Curries',
      price: 34900, // ₹349.00
      imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500',
      available: true
    },
    {
      restaurantId,
      name: 'Matcha Iced Tea',
      description: 'Japanese ceremonial green tea shaken with fresh lime and honey.',
      category: 'Beverages',
      price: 13900, // ₹139.00
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500',
      available: true
    },
    {
      restaurantId,
      name: 'Crab Rangoon Wontons (Chef Special)',
      description: 'Crispy golden wonton pillows filled with real crab meat and cream cheese.',
      category: 'Appetizers',
      price: 37900, // ₹379.00
      imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500',
      available: false // unavailable test item
    }
  ];
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Cleaning old collection data...');
    await Promise.all([
      Restaurant.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({})
    ]);

    console.log('[Seed] Inserting 3 restaurants...');
    const createdRestaurants = await Restaurant.insertMany(sampleRestaurants);

    let totalMenuItems = 0;
    for (const restaurant of createdRestaurants) {
      const items = getMenuItemsForRestaurant(restaurant.name, restaurant._id);
      await MenuItem.insertMany(items);
      totalMenuItems += items.length;
      console.log(`[Seed] Added ${items.length} menu items for "${restaurant.name}" (ID: ${restaurant._id})`);
    }

    console.log('\n==================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log(`🏪 Restaurants created: ${createdRestaurants.length}`);
    console.log(`🍽️  Menu items created: ${totalMenuItems}`);
    console.log('==================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`❌ [Seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
