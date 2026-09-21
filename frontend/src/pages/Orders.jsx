import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Clock, Star, MapPin, CaretRight, MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import './ProfilePages.css';

const Orders = () => {
  const { token } = useAuth();
  const [filter, setFilter] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock rating state
  const [ratedOrders, setRatedOrders] = useState({});
  const [ratingActive, setRatingActive] = useState(null);
  
  const handleRate = (orderId, stars) => {
    setRatedOrders(prev => ({ ...prev, [orderId]: stars }));
    setRatingActive(null);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders?limit=50', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        
        if (data.success && data.data?.items) {
          setOrders(data.data.items);
        }
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [token]);

  const activeStatuses = ['PLACED', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'PICKED_UP'];
  
  const filteredOrders = orders.filter(o => {
    if (filter === 'active') {
      return activeStatuses.includes(o.status);
    } else {
      return !activeStatuses.includes(o.status);
    }
  });

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Your Orders</h1>
        <p className="subtitle">Track active deliveries and review your past meals</p>
      </div>

      <div className="orders-filters">
        <button className={`order-filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
          Active Orders
        </button>
        <button className={`order-filter-btn ${filter === 'history' ? 'active' : ''}`} onClick={() => setFilter('history')}>
          Order History
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your orders...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--muted)' }}>
          <h3>No {filter} orders found.</h3>
          <p>When you place an order, it will appear here.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Explore Restaurants</Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-top">
                <div className="order-restaurant-info">
                  <h3>{order.restaurantId?.name || 'Restaurant'}</h3>
                  <span className={`order-status ${order.status.toLowerCase()}`}>{order.status.replace(/_/g, ' ')}</span>
                </div>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="order-items-list">
                {order.items?.map((item, i) => (
                  <span key={i} className="order-item-name">{item.quantity}x {item.itemNameSnapshot}</span>
                ))}
              </div>
              <div className="order-card-bottom">
                <span className="order-total">₹{(order.totalAmount / 100 || 0).toFixed(2)}</span>
                <span className="order-id">#{order._id.substring(0, 8).toUpperCase()}</span>
                <div className="order-actions">
                  {filter === 'active' ? (
                    <Link to={`/order/${order._id}`} className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '14px' }}>Track Order</Link>
                  ) : (
                    <>
                      {ratedOrders[order._id] ? (
                        <span style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star weight="fill" /> {ratedOrders[order._id]} Stars
                        </span>
                      ) : ratingActive === order._id ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              weight="fill" 
                              style={{ cursor: 'pointer', color: 'var(--brand)' }}
                              onClick={() => handleRate(order._id, star)}
                            />
                          ))}
                        </div>
                      ) : (
                        <button className="btn-rate" onClick={() => setRatingActive(order._id)}>Rate Order</button>
                      )}
                      <button className="btn-reorder" onClick={() => alert('Order items added to cart!')}>Reorder</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
