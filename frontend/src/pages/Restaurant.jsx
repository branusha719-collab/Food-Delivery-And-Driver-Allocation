import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Plus, Minus, ArrowRight } from '@phosphor-icons/react';
import { RESTAURANTS } from '../data/mockData';
import axios from 'axios';
import './Restaurant.css';

const Restaurant = ({ cart, addToCart, clearCart }) => {
  const { id } = useParams();
  
  // Find the restaurant from our mock dataset
  const restaurantData = RESTAURANTS.find(r => r.id === parseInt(id));
  
  const [menu, setMenu] = useState(restaurantData ? restaurantData.menu : []);
  
  // Real API integration stub (uncomment when backend is fully ready and populated)
  /*
  useEffect(() => {
    axios.get(`http://localhost:5000/api/restaurants/${id}/menu`)
      .then(res => setMenu(res.data.data))
      .catch(err => console.error("Could not fetch menu, using mock data", err));
  }, [id]);
  */

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  if (!restaurantData) return <div>Restaurant not found</div>;

  return (
    <div className="restaurant-page">
      <div className="restaurant-hero">
        <img 
          src={restaurantData.image} 
          alt="Restaurant" 
          className="hero-img"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80"; e.target.onerror = null; }}
        />
        <div className="restaurant-info-card card-level-1 glass-surface">
          <div className="info-header">
            <h1>{restaurantData.name}</h1>
            <div className="rating-badge large">
              <Star size={16} weight="fill" /> {restaurantData.rating}
            </div>
          </div>
          <p className="cuisine-tags">{restaurantData.categories}</p>
          <div className="info-meta">
            <span><MapPin size={16} /> {restaurantData.distance} away</span>
            <span><Clock size={16} /> {restaurantData.deliveryTime} delivery</span>
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
                <button className="add-btn" onClick={() => addToCart(item)}>
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
