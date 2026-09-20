import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, ShoppingCart, MapPin, User, Bell } from '@phosphor-icons/react';
import './Header.css';

const Header = ({ cartCount }) => {
  return (
    <header className="site-header glass-surface">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          Foodgy
        </Link>
        <div className="location-selector">
          <MapPin size={20} weight="fill" color="var(--primary)" />
          <span className="location-text">Deliver to: 742 Evergreen Terrace</span>
          <span className="delivery-time">⚡ 25-35 mins</span>
        </div>
        <div className="search-bar">
          <MagnifyingGlass size={20} color="var(--outline)" className="search-icon" />
          <input type="text" placeholder="Search for artisan sushi, wood-fired pizza..." />
          <div className="shortcut-badge">⌘K</div>
        </div>
        <div className="trailing-actions">
          <button className="action-btn icon-btn"><Bell size={24} /></button>
          <button className="action-btn cart-btn">
            <ShoppingCart size={24} />
            <span className="cart-text">Cart ({cartCount})</span>
          </button>
          <button className="action-btn user-profile">
            <User size={24} weight="fill" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
