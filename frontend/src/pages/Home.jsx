import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bicycle, CaretDown } from '@phosphor-icons/react';
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "@/registry/magicui/animated-shiny-text";
import { VideoText } from "@/registry/magicui/video-text";
import { RESTAURANTS } from '../data/mockData';
import './Home.css';

const CATEGORIES = [
  'Gourmet & Fine Dine', 'Artisan Sushi', 'Wood-Fired Pizza', 
  'Healthy & Bowls', 'Craft Burgers', 'French Patisserie', 
  'Authentic Asian', 'Vegan & Organics'
];

const SORT_OPTIONS = [
  { id: 'curated', label: 'Curated for You' },
  { id: 'delivery', label: 'Delivery Time' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
];

const Home = () => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <button className="category-pill active">All Cuisines</button>
          {CATEGORIES.map(cat => (
            <button key={cat} className="category-pill">{cat}</button>
          ))}
        </div>
      </section>

      <section className="filters-section">
        <div className="filter-pills">
          <button className="filter-pill">Top Rated 4.5+</button>
          <button className="filter-pill">Under 30 Mins</button>
          <button className="filter-pill">Pure Veg</button>
          <button className="filter-pill">Michelin Recommended</button>
          <button className="filter-pill">Free Delivery</button>
          <button className="filter-pill">Price: $$ - $$$</button>
        </div>
        <div className="custom-dropdown" ref={dropdownRef}>
          <button 
            className="custom-dropdown-trigger" 
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            {selectedSort.label} <CaretDown size={14} weight="bold" />
          </button>
          
          {isSortOpen && (
            <div className="custom-dropdown-menu">
              {SORT_OPTIONS.map(option => (
                option.id !== selectedSort.id && (
                  <button
                    key={option.id}
                    className="custom-dropdown-item"
                    onClick={() => {
                      setSelectedSort(option);
                      setIsSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="restaurants-section">
        <h2 className="section-title">Premier Restaurants</h2>
        <div className="restaurant-grid">
          {RESTAURANTS.map(restaurant => (
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
