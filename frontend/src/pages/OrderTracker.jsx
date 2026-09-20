import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, CookingPot, CarProfile, MapPinLine } from '@phosphor-icons/react';
import './OrderTracker.css';

const OrderTracker = () => {
  const { id } = useParams();
  
  // Realtime simulation state
  const [statusIndex, setStatusIndex] = useState(0);
  
  const statuses = [
    { label: "Order Placed", icon: <CheckCircle size={24} weight="fill" />, time: "12:30 PM" },
    { label: "Preparing", icon: <CookingPot size={24} weight="fill" />, time: "12:35 PM" },
    { label: "Driver Assigned", icon: <CarProfile size={24} weight="fill" />, time: "12:45 PM" },
    { label: "Out for Delivery", icon: <MapPinLine size={24} weight="fill" />, time: "12:50 PM" },
    { label: "Delivered", icon: <CheckCircle size={24} weight="fill" color="var(--tertiary)" />, time: "1:00 PM" }
  ];

  useEffect(() => {
    // Simulate real-time tracking progression
    const interval = setInterval(() => {
      setStatusIndex(prev => {
        if (prev < statuses.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 4000); // Progress every 4 seconds for demo
    
    return () => clearInterval(interval);
  }, [statuses.length]);

  return (
    <div className="order-tracker-page">
      <div className="tracker-container card-level-1">
        <div className="tracker-header">
          <h2>Tracking Order #{id}</h2>
          <span className="eta-badge">ETA: {statuses[statusIndex].time === "1:00 PM" ? "Delivered" : "15 mins"}</span>
        </div>

        <div className="map-placeholder">
          {/* In a real app, integrate Google Maps or Mapbox here */}
          <div className="map-overlay">
            {statusIndex >= 3 ? (
              <div className="driver-marker pulse">🚗</div>
            ) : (
              <div className="restaurant-marker">🍳 Preparing at L'Atelier Bistro</div>
            )}
          </div>
        </div>

        <div className="timeline-container">
          {statuses.map((status, index) => {
            const isActive = index <= statusIndex;
            const isCurrent = index === statusIndex;
            return (
              <div key={index} className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-icon-wrapper">
                  {status.icon}
                  {index < statuses.length - 1 && <div className="step-line"></div>}
                </div>
                <div className="step-content">
                  <h4>{status.label}</h4>
                  {isActive && <span className="step-time">{status.time}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {statusIndex >= 2 && (
          <div className="driver-info card-level-1">
            <div className="driver-avatar">
              <User size={32} weight="fill" />
            </div>
            <div className="driver-details">
              <h4>Alex Smith</h4>
              <p>Honda Civic • AB-1234</p>
              <span className="driver-rating">★ 4.9</span>
            </div>
            <button className="btn-secondary call-btn">Contact</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple User icon for driver avatar fallback
const User = ({size, weight}) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,120a56,56,0,1,0-56-56A56.06,56.06,0,0,0,128,120Zm0-96a40,40,0,1,1-40,40A40,40,0,0,1,128,24ZM212.8,206.4a85.24,85.24,0,0,0-57.94-55.51,8,8,0,0,0-4,15.49A69.3,69.3,0,0,1,198,212.8a8,8,0,0,0,11.31-11.31Z"></path>
  </svg>
);

export default OrderTracker;
