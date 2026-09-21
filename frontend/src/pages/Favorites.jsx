import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, MapPin, Trash } from '@phosphor-icons/react';
import './ProfilePages.css';

const MOCK_FAVORITES = [
  { id: 1, name: 'La Trattoria', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', rating: '4.8', categories: 'Pasta • Comfort Food', deliveryTime: '16-31 min', distance: '4.7 km' },
  { id: 3, name: 'Spice Route', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80', rating: '4.8', categories: 'Chicken • Comfort Food', deliveryTime: '24-36 min', distance: '0.6 km' },
  { id: 6, name: 'Sweet Treats Patisserie', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600&q=80', rating: '4.8', categories: 'Dessert • Comfort Food', deliveryTime: '27-43 min', distance: '0.9 km' },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Favorites</h1>
        <p className="subtitle">Your go-to restaurants, saved for quick access</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <Heart size={64} weight="thin" />
          <h3>No favorites yet</h3>
          <p>Browse restaurants and tap the heart icon to save them here.</p>
          <Link to="/" className="btn-primary-link">Explore Restaurants</Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fav => (
            <div key={fav.id} className="favorite-card">
              <div className="favorite-img-wrapper">
                <img src={fav.image} alt={fav.name} />
                <button className="remove-fav-btn" onClick={() => removeFavorite(fav.id)} title="Remove from favorites">
                  <Trash size={16} />
                </button>
              </div>
              <div className="favorite-info">
                <div className="favorite-top-row">
                  <h3>{fav.name}</h3>
                  <span className="fav-rating"><Star size={14} weight="fill" /> {fav.rating}</span>
                </div>
                <span className="fav-categories">{fav.categories}</span>
                <span className="fav-delivery"><Clock size={14} /> {fav.deliveryTime} • {fav.distance}</span>
              </div>
              <Link to={`/restaurant/${fav.id}`} className="btn-order-now">Order Now</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
