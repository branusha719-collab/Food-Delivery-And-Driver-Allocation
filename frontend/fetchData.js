const https = require('https');
const fs = require('fs');
const path = require('path');

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const HIGH_RES_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1600&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
  "https://images.unsplash.com/photo-1579871494447-0811cf80d49d?w=1600&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=1600&q=80",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1600&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1600&q=80"
];

const RESTAURANT_TEMPLATES = [
  { name: "La Trattoria", category: "Pasta" },
  { name: "Ocean's Catch", category: "Seafood" },
  { name: "Spice Route", category: "Chicken" },
  { name: "The Green Bowl", category: "Vegan" },
  { name: "Beef & Barrel", category: "Beef" },
  { name: "Sweet Treats Patisserie", category: "Dessert" },
  { name: "Oink Oink BBQ", category: "Pork" },
  { name: "Morning Glory Diner", category: "Breakfast" },
  { name: "Tokyo Drift Sushi", category: "Seafood" },
  { name: "Mamma Mia Pizzeria", category: "Pasta" },
  { name: "Golden Wok", category: "Chicken" },
  { name: "Plant Based Paradise", category: "Vegan" },
  { name: "Steakhouse 99", category: "Beef" },
  { name: "Sugar Rush", category: "Dessert" },
  { name: "Smokey Ribs", category: "Pork" },
  { name: "Sunrise Cafe", category: "Breakfast" },
  { name: "Luigi's Italian", category: "Pasta" },
  { name: "Catch of the Day", category: "Seafood" },
  { name: "Cluck Cluck Chicken", category: "Chicken" },
  { name: "Earthly Eats", category: "Vegan" },
  { name: "The Wagyu Room", category: "Beef" },
  { name: "Choco Loco", category: "Dessert" },
  { name: "Bacon Brothers", category: "Pork" },
  { name: "Early Bird Bites", category: "Breakfast" }
];

async function generateData() {
  console.log("Fetching categories from TheMealDB...");
  
  const restaurants = [];
  
  for (let i = 0; i < RESTAURANT_TEMPLATES.length; i++) {
    const template = RESTAURANT_TEMPLATES[i];
    console.log(`Fetching meals for ${template.name} (${template.category})...`);
    
    try {
      const data = await fetchJson(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${template.category}`);
      let meals = data.meals || [];
      
      // Shuffle meals to get different ones for same categories
      meals = meals.sort(() => 0.5 - Math.random());
      
        const menu = meals.slice(0, 12).map(meal => {
        const price = Math.floor(Math.random() * 25) + 10 + 0.99;
        return {
          id: meal.idMeal,
          name: meal.strMeal,
          description: `Authentic and delicious ${template.category.toLowerCase()} dish prepared with the finest ingredients.`,
          price: price,
          image: meal.strMealThumb + "/preview", // smaller image for menu
          dietary: template.category === 'Vegan' ? 'Veg' : 'Non-Veg'
        };
      });
      
      // Use high quality unsplash image for hero
      const heroImage = HIGH_RES_IMAGES[i % HIGH_RES_IMAGES.length];
      const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
      const reviews = Math.floor(Math.random() * 4000) + 100;
      const deliveryTime = `${Math.floor(Math.random() * 20) + 10}-${Math.floor(Math.random() * 20) + 30} min`;
      const distance = (Math.random() * 5 + 0.5).toFixed(1);
      
      restaurants.push({
        id: i + 1,
        name: template.name,
        image: heroImage,
        rating: rating,
        reviews: `${reviews}+`,
        categories: `${template.category} • Comfort Food • $$`,
        deliveryTime: deliveryTime,
        distance: `${distance} km`,
        featured: `Must try: ${menu[0]?.name}`,
        badge: i % 4 === 0 ? 'Free Delivery' : (i % 5 === 0 ? 'Top Rated' : null),
        menu: menu
      });
    } catch (e) {
      console.error(`Failed to fetch for ${template.category}`, e);
    }
  }
  
  const fileContent = `// Automatically generated from TheMealDB\n\nexport const RESTAURANTS = ${JSON.stringify(restaurants, null, 2)};\n`;
  
  const targetDir = path.join(__dirname, 'src', 'data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(targetDir, 'mockData.js'), fileContent);
  console.log("Data generated successfully at src/data/mockData.js!");
}

generateData();
