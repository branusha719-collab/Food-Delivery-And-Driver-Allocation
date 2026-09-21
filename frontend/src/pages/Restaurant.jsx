import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Plus, Minus, ArrowRight } from '@phosphor-icons/react';
import { RESTAURANTS } from '../data/mockData';
import './Restaurant.css';

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600&q=80',
];

const Restaurant = ({ cart, addToCart, clearCart }) => {
  const { id } = useParams();
  
  // Try to find from mock data first (for numeric IDs)
  const mockRestaurant = RESTAURANTS.find(r => r.id === parseInt(id));
  
  const [restaurantInfo, setRestaurantInfo] = useState(mockRestaurant ? {
    name: mockRestaurant.name,
    image: mockRestaurant.image,
    rating: mockRestaurant.rating,
    categories: mockRestaurant.categories,
    distance: mockRestaurant.distance,
    deliveryTime: mockRestaurant.deliveryTime,
  } : null);
  
  const [menu, setMenu] = useState(mockRestaurant ? mockRestaurant.menu : []);
  const [realRestaurantId, setRealRestaurantId] = useState(mockRestaurant ? null : id);
  const [loading, setLoading] = useState(!mockRestaurant);

  useEffect(() => {
    // If this is a MongoDB ObjectId (24 hex chars), fetch from API
    if (/^[a-f0-9]{24}$/i.test(id)) {
      setLoading(true);
      
      // Fetch menu items from API
      fetch(`/api/restaurants/${id}/menu?limit=50`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.items) {
            const apiMenu = data.data.items.map(item => ({
              id: item._id,
              name: item.name,
              description: item.description || 'Delicious dish prepared fresh',
              price: item.price / 100, // Convert paise to currency
              image: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
              dietary: 'Non-Veg',
              _mongoId: item._id,
              _restaurantId: id
            }));
            setMenu(apiMenu);
            setRealRestaurantId(id);
            
            // Set restaurant info if not from mock
            if (!mockRestaurant) {
              setRestaurantInfo({
                name: data.data.items[0]?.restaurantId?.name || 'Restaurant',
                image: RESTAURANT_IMAGES[0],
                rating: '4.7',
                categories: 'Multi-Cuisine • $$',
                distance: '3.2 km',
                deliveryTime: '20-35 min',
              });
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const handleAddToCart = (item) => {
    // Attach the real restaurant ID for API order creation
    addToCart({
      ...item,
      _restaurantId: realRestaurantId || id,
      _mongoId: item._mongoId || item.id
    });
  };

  if (loading) return <div className="restaurant-page" style={{padding: '2rem', textAlign: 'center'}}>Loading restaurant...</div>;
  if (!restaurantInfo) return <div>Restaurant not found</div>;

  return (
    <div className="restaurant-page">
      <div className="restaurant-hero">
        <img 
          src={restaurantInfo.image} 
          alt="Restaurant" 
          className="hero-img"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"; e.target.onerror = null; }}
        />
        <div className="restaurant-info-card card-level-1 glass-surface">
          <div className="info-header">
            <h1>{restaurantInfo.name}</h1>
            <div className="rating-badge large">
              <Star size={16} weight="fill" /> {restaurantInfo.rating}
            </div>
          </div>
          <p className="cuisine-tags">{restaurantInfo.categories}</p>
          <div className="info-meta">
            <span><MapPin size={16} /> {restaurantInfo.distance} away</span>
            <span><Clock size={16} /> {restaurantInfo.deliveryTime} delivery</span>
          </div>
        </div>
      </div>

      <div className="menu-section">
        <div className="menu-categories">
          <button className="category-pill active">Signatures</button>
          <button className="category-pill">Appetizers</button>
          <button className="category-pill">Mains</button>
          <button className="category-pill">Desserts</button>
        </div>

        <div className="menu-grid">
          {menu.map(item => (
            <div key={item.id} className="menu-item-card card-level-1">
              <div className="menu-item-content">
                <div className="dietary-badge" data-type={item.dietary}>
                  <div className="inner-dot"></div>
                </div>
                <h3>{item.name}</h3>
                <p className="item-price">${item.price.toFixed(2)}</p>
                <p className="item-desc">{item.description}</p>
              </div>
              <div className="menu-item-image">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"; e.target.onerror = null; }}
                />
                <button className="add-btn" onClick={() => handleAddToCart(item)}>
                  <Plus size={16} weight="bold" /> ADD
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="floating-cart glass-surface">
          <div className="cart-summary">
            <span className="cart-items">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
            <span className="cart-total">${cartTotal.toFixed(2)}</span>
          </div>
          <Link to="/order/checkout" className="btn-primary checkout-btn">
            Checkout <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Restaurant;
