import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlass, ShoppingCart, MapPin, User, Bell, 
  CaretDown, Receipt, Heart, CreditCard, AddressBook, Gear, SignOut, Plus 
} from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import './Header.css';

const SAVED_ADDRESSES = [
  { id: 1, title: 'Home', address: '742 Evergreen Terrace' },
  { id: 2, title: 'Work', address: '123 Fake Street, Suite 400' }
];

const Header = ({ cartCount }) => {
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0]);
  
  const addressRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressRef.current && !addressRef.current.contains(event.target)) {
        setIsAddressOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="site-header glass-surface">
      <div className="header-container">
        <Link to="/" className="brand-logo">
          Foodgy
        </Link>
        
        {/* Address Dropdown */}
        <div className="header-dropdown-container" ref={addressRef}>
          <div 
            className="location-selector interactive" 
            onClick={() => setIsAddressOpen(!isAddressOpen)}
          >
            <MapPin size={20} weight="fill" color="var(--primary)" className="shrink-0" />
            <div className="location-text-group">
              <span className="location-title">Deliver to <CaretDown size={12} weight="bold" /></span>
              <span className="location-text">{selectedAddress.address}</span>
            </div>
            <span className="delivery-time">⚡ 25-35 mins</span>
          </div>

          {isAddressOpen && (
            <div className="header-dropdown-menu address-menu">
              <div className="dropdown-header">Choose Delivery Address</div>
              {SAVED_ADDRESSES.map(addr => (
                <button 
                  key={addr.id} 
                  className={cn("header-dropdown-item", selectedAddress.id === addr.id && "active")}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setIsAddressOpen(false);
                  }}
                >
                  <MapPin size={18} weight={selectedAddress.id === addr.id ? "fill" : "regular"} className="item-icon" />
                  <div className="address-item-details">
                    <span className="address-title">{addr.title}</span>
                    <span className="address-desc">{addr.address}</span>
                  </div>
                </button>
              ))}
              <div className="dropdown-divider"></div>
              <button className="header-dropdown-item add-new" onClick={() => setIsAddressOpen(false)}>
                <Plus size={18} className="item-icon" />
                <span className="address-title">Add New Address</span>
              </button>
            </div>
          )}
        </div>

        <div className="search-bar">
          <MagnifyingGlass size={20} color="var(--outline)" className="search-icon shrink-0" />
          <input type="text" placeholder="Search for artisan sushi, wood-fired pizza..." />
          <div className="shortcut-badge">⌘K</div>
        </div>
        
        <div className="trailing-actions">
          <button className="action-btn icon-btn"><Bell size={24} /></button>
          <button className="action-btn cart-btn">
            <ShoppingCart size={24} />
            <span className="cart-text">Cart ({cartCount})</span>
          </button>
          
          {/* Profile Dropdown */}
          <div className="header-dropdown-container" ref={profileRef}>
            <button 
              className="action-btn user-profile interactive"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <User size={24} weight="fill" />
            </button>

            {isProfileOpen && (
              <div className="header-dropdown-menu profile-menu">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <User size={24} weight="fill" />
                  </div>
                  <div className="profile-info">
                    <span className="profile-name">John Doe</span>
                    <span className="profile-phone">+1 (555) 123-4567</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="header-dropdown-item">
                  <Receipt size={18} className="item-icon" /> Orders
                </button>
                <button className="header-dropdown-item">
                  <Heart size={18} className="item-icon" /> Favorites
                </button>
                <button className="header-dropdown-item">
                  <CreditCard size={18} className="item-icon" /> Payments
                </button>
                <button className="header-dropdown-item">
                  <AddressBook size={18} className="item-icon" /> Addresses
                </button>
                <div className="dropdown-divider"></div>
                <button className="header-dropdown-item">
                  <Gear size={18} className="item-icon" /> Settings
                </button>
                <button className="header-dropdown-item text-error">
                  <SignOut size={18} className="item-icon" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
