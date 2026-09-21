import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bicycle, CaretDown } from '@phosphor-icons/react';
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "@/registry/magicui/animated-shiny-text";
import { VideoText } from "@/registry/magicui/video-text";
import { RESTAURANTS as MOCK_RESTAURANTS } from '../data/mockData';
import './Home.css';

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
];

const CATEGORIES = [
  'Gourmet & Fine Dine', 'Artisan Sushi', 'Wood-Fired Pizza', 
  'Healthy & Bowls', 'Craft Burgers', 'French Patisserie', 
  'Authentic Asian', 'Vegan & Organics'
];

const FILTERS = [
  { id: 'top_rated', label: 'Top Rated 4.5+' },
  { id: 'fast_delivery', label: 'Under 30 Mins' },
  { id: 'veg', label: 'Pure Veg & Vegan' },
  { id: 'free_delivery', label: 'Free Delivery' }
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All Cuisines');
  const [activeFilters, setActiveFilters] = useState([]);
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for search from Header
  useEffect(() => {
    const handler = (e) => setSearchQuery(e.detail || '');
    window.addEventListener('foodgy-search', handler);
    return () => window.removeEventListener('foodgy-search', handler);
  }, []);

  useEffect(() => {
    fetch('/api/restaurants?limit=100&active=true')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.items?.length > 0) {
          // Merge real DB restaurants with visual defaults
          const dbRestaurants = data.data.items.map((r, i) => ({
            id: r._id,
            name: r.name,
            image: RESTAURANT_IMAGES[i % RESTAURANT_IMAGES.length],
            rating: (4.3 + Math.random() * 0.7).toFixed(1),
            reviews: `${Math.floor(200 + Math.random() * 2000)}+`,
            categories: r.description || 'Multi-Cuisine',
            deliveryTime: `${15 + Math.floor(Math.random() * 10)}-${28 + Math.floor(Math.random() * 15)} min`,
            distance: `${(1 + Math.random() * 6).toFixed(1)} km`,
            featured: `Must try: ${r.name} specials`,
            badge: i % 3 === 0 ? 'Free Delivery' : null,
            menu: [] // menu loaded on restaurant page
          }));
          setRestaurants(dbRestaurants);
        }
      })
      .catch(() => {
        // Keep mock data on error
      });
  }, []);

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = restaurant.name.toLowerCase().includes(q);
      const catMatch = restaurant.categories.toLowerCase().includes(q);
      const featMatch = restaurant.featured?.toLowerCase().includes(q);
      if (!nameMatch && !catMatch && !featMatch) return false;
    }

    if (activeCategory !== 'All Cuisines') {
      if (!restaurant.categories.toLowerCase().includes(activeCategory.split(' ')[0].toLowerCase())) {
         return false;
      }
    }

    if (activeFilters.includes('top_rated')) {
      if (parseFloat(restaurant.rating) < 4.5) return false;
    }
    if (activeFilters.includes('fast_delivery')) {
      const maxTime = parseInt(restaurant.deliveryTime.split('-')[1]);
      if (maxTime > 30) return false;
    }
    if (activeFilters.includes('veg')) {
      if (!restaurant.categories.toLowerCase().includes('veg')) return false;
    }
    if (activeFilters.includes('free_delivery')) {
      if (restaurant.badge !== 'Free Delivery') return false;
    }

    return true;
  });

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">FOODGYGOLD: 20% off Michelin Partner kitchens</span>
          <h1>Culinary Excellence Delivered</h1>
          <p>Experience the city's finest dining, right at your doorstep.</p>
          <button className="btn-primary">Explore Gourmet Collection</button>
          
          <div className="hero-stats">
            <div className="stat-pill">500+ Curated Chefs</div>
            <div className="stat-pill">Avg 28 min Delivery</div>
            <div className="stat-pill">100% Temp-Controlled</div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="categories-scroll">
          <button 
            className={cn("category-pill", activeCategory === 'All Cuisines' && "active")}
            onClick={() => setActiveCategory('All Cuisines')}
          >
            All Cuisines
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={cn("category-pill", activeCategory === cat && "active")}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="filters-section">
        <div className="filter-pills">
          {FILTERS.map(filter => (
            <button 
              key={filter.id} 
              className={cn("filter-pill", activeFilters.includes(filter.id) && "active-filter")}
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="restaurants-section">
        <h2 className="section-title">Premier Restaurants</h2>
        <div className="restaurant-grid">
          {filteredRestaurants.length > 0 ? filteredRestaurants.map(restaurant => (
            <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id} className="restaurant-card card-level-1">
              <div className="card-image-wrapper">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name} 
                  className="restaurant-image" 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"; e.target.onerror = null; }}
                />
                <div className="card-badges">
                  {restaurant.badge && <span className="discount-badge">{restaurant.badge}</span>}
                  <span className="time-badge"><Clock size={14}/> {restaurant.deliveryTime} • {restaurant.distance}</span>
                </div>
              </div>
              <div className="card-content">
                <div className="card-header">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <div className="rating-badge">
                    <Star size={14} weight="fill" />
                    <span>{restaurant.rating} ({restaurant.reviews})</span>
                  </div>
                </div>
                <div className="restaurant-meta">
                  {restaurant.categories}
                </div>
                <div className="featured-dish">
                  {restaurant.featured}
                </div>
              </div>
            </Link>
          )) : (
            <div className="col-span-full py-12 text-center text-neutral-500">
              No restaurants found matching your filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
