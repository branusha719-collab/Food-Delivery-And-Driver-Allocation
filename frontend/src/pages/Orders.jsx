import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Clock, Star, MapPin, CaretRight, MagnifyingGlass } from '@phosphor-icons/react';
import './ProfilePages.css';

const MOCK_ORDERS = [
  { id: 'ORD-7821', restaurant: 'La Trattoria', items: ['Chilli prawn linguine', 'Lasagne'], total: 47.98, date: '2026-09-18', status: 'Delivered', rating: 5 },
  { id: 'ORD-6453', restaurant: 'Ocean\'s Catch', items: ['Garides Saganaki', 'Fish pie'], total: 35.98, date: '2026-09-15', status: 'Delivered', rating: 4 },
  { id: 'ORD-5190', restaurant: 'Spice Route', items: ['Chicken Basquaise'], total: 33.99, date: '2026-09-12', status: 'Delivered', rating: null },
  { id: 'ORD-4877', restaurant: 'The Green Bowl', items: ['Vegan banh mi', 'Vegan Lasagna'], total: 37.98, date: '2026-09-10', status: 'Cancelled', rating: null },
  { id: 'ORD-3201', restaurant: 'Sweet Treats Patisserie', items: ['Apam balik', 'Alfajores'], total: 62.98, date: '2026-09-05', status: 'Delivered', rating: 5 },
];

const Orders = () => {
  const [filter, setFilter] = useState('all');

  const filtered = MOCK_ORDERS.filter(o => {
    if (filter === 'all') return true;
    return o.status.toLowerCase() === filter;
  });

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Your Orders</h1>
        <p className="subtitle">Track, reorder, and review your past meals</p>
      </div>

      <div className="orders-filters">
        {['all', 'delivered', 'cancelled'].map(f => (
          <button key={f} className={`order-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="orders-list">
        {filtered.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-top">
              <div className="order-restaurant-info">
                <h3>{order.restaurant}</h3>
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <span className="order-date">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <span key={i} className="order-item-name">{item}</span>
              ))}
            </div>
            <div className="order-card-bottom">
              <span className="order-total">${order.total.toFixed(2)}</span>
              <span className="order-id">{order.id}</span>
              <div className="order-actions">
                {order.status === 'Delivered' && !order.rating && (
                  <button className="btn-rate">Rate Order</button>
                )}
                {order.status === 'Delivered' && (
                  <button className="btn-reorder">Reorder</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
