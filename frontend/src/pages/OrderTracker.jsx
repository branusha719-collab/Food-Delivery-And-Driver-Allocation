import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  CheckCircle,
  CookingPot,
  CarProfile,
  MapPinLine
} from '@phosphor-icons/react';
import './OrderTracker.css';

const API_BASE_URL = '/api';
const SOCKET_URL = 'http://localhost:5000'; // Match backend port

const OrderTracker = () => {
  const { id } = useParams();

  const [statusIndex, setStatusIndex] = useState(0);
  const [assigning, setAssigning] = useState(false);
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState('');
  const [cancellationReason, setCancellationReason] = useState(null);

  // Map backend status strings to status indices
  const statusMap = {
    'PLACED': 0,
    'RESTAURANT_ACCEPTED': 1,
    'PREPARING': 1,
    'READY': 1,
    'DRIVER_ASSIGNED': 2,
    'PICKED_UP': 3,
    'DELIVERED': 4,
    'REJECTED': -1
  };

  useEffect(() => {
    // Connect to Socket.IO backend
    const socket = io(SOCKET_URL);

    // Fetch initial order state
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success && data.data) {
          const status = data.data.status;
          if (statusMap[status] !== undefined) {
            setStatusIndex(statusMap[status]);
          }
          if (data.data.cancellationReason) {
            setCancellationReason(data.data.cancellationReason);
          }
          if (data.data.driver) {
            setDriver(data.data.driver);
          } else if (data.data.driverId) {
            setDriver({ name: 'Assigned Driver', vehicleType: 'Unknown', rating: 'N/A', activeOrders: 1 });
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial order state", err);
      }
    };
    fetchOrder();

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      // Join room for this specific order
      socket.emit('join_order', id);
    });

    // Listen for order updates
    socket.on('order_updated', (updatedOrder) => {
      console.log('Real-time update:', updatedOrder);
      if (statusMap[updatedOrder.status] !== undefined) {
        setStatusIndex(statusMap[updatedOrder.status]);
      }
    });

    // Listen for driver assignment
    socket.on('driver_assigned', (updatedOrder) => {
      console.log('Driver assigned (real-time):', updatedOrder);
      if (statusMap[updatedOrder.status] !== undefined) {
        setStatusIndex(statusMap[updatedOrder.status]);
      }
      if (updatedOrder.cancellationReason) {
        setCancellationReason(updatedOrder.cancellationReason);
      }
      if (updatedOrder.driver) {
        setDriver(updatedOrder.driver);
      } else if (updatedOrder.driverId) {
        // Fallback if driver details aren't included but driverId is
        setDriver({ name: 'Assigned Driver', vehicleType: 'Unknown', rating: 'N/A', activeOrders: 1 });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const statuses = [
    {
      label: 'Order Placed',
      icon: <CheckCircle size={24} weight="fill" />,
      time: '12:30 PM'
    },
    {
      label: 'Preparing',
      icon: <CookingPot size={24} weight="fill" />,
      time: '12:35 PM'
    },
    {
      label: 'Driver Assigned',
      icon: <CarProfile size={24} weight="fill" />,
      time: '12:45 PM'
    },
    {
      label: 'Out for Delivery',
      icon: <MapPinLine size={24} weight="fill" />,
      time: '12:50 PM'
    },
    {
      label: 'Delivered',
      icon: <CheckCircle size={24} weight="fill" />,
      time: '1:00 PM'
    }
  ];

  const handleAssignDriver = async () => {
    try {
      setAssigning(true);
      setError('');

      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/orders/${id}/assign-driver`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            driverId: 'AUTO'
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to allocate driver'
        );
      }

      const selectedDriver = result.data?.selectedDriver;

      setDriver(selectedDriver || null);

      // Move the tracker to Driver Assigned.
      setStatusIndex(2);

    } catch (err) {
      console.error('Driver allocation failed:', err);
      setError(
        err.message || 'Unable to allocate driver'
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="order-tracker-page">
      <div className="tracker-container card-level-1">

        <div className="tracker-header">
          <h2>Tracking Order #{id}</h2>

          {statusIndex === -1 ? (
            <span className="eta-badge" style={{ backgroundColor: 'var(--destructive)', color: 'white' }}>
              Cancelled
            </span>
          ) : (
            <span className="eta-badge">
              {statusIndex >= 4 ? 'Delivered' : '15 mins'}
            </span>
          )}
        </div>

        {statusIndex === -1 ? (
          <div className="cancelled-state card-level-1" style={{ padding: '2rem', textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--destructive)' }}>Order Cancelled</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>We're sorry, your order could not be fulfilled.</p>
            {cancellationReason && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--destructive)' }}>
                <strong>Reason:</strong> {cancellationReason}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="map-placeholder">
              <div className="map-overlay">
                {statusIndex >= 3 ? (
                  <div className="driver-marker pulse">
                    🚗
                  </div>
                ) : (
                  <div className="restaurant-marker">
                    🍽️ Preparing your order
                  </div>
                )}
              </div>
            </div>

            <div className="timeline-container">
              {statuses.map((status, index) => {
                const isActive = index <= statusIndex;
                const isCurrent = index === statusIndex;

                return (
                  <div
                    key={index}
                    className={`timeline-step ${
                      isActive ? 'active' : ''
                    } ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="step-icon-wrapper">
                      {status.icon}

                      {index < statuses.length - 1 && (
                        <div className="step-line"></div>
                      )}
                    </div>

                    <div className="step-content">
                      <h4>{status.label}</h4>

                      {isActive && (
                        <span className="step-time">
                          {status.time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Selected Driver */}
        {driver && (
          <div className="driver-info card-level-1">

            <div className="driver-avatar">
              <User size={32} weight="fill" />
            </div>

            <div className="driver-details">
              <h4>{driver.name}</h4>

              <p>
                Vehicle: {driver.vehicleType}
              </p>

              <p>
                Active Orders: {driver.activeOrders}
              </p>

              <span className="driver-rating">
                ⭐ {driver.rating}
              </span>
            </div>

            <span className="driver-assigned-badge">
              DRIVER ASSIGNED
            </span>

          </div>
        )}
      </div>
    </div>
  );
};

// Driver avatar icon
const User = ({ size, weight }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="currentColor"
  >
    <path d="M128,120a56,56,0,1,0-56-56A56.06,56.06,0,0,0,128,120Zm0-96a40,40,0,1,1-40,40A40,40,0,0,1,128,24ZM212.8,206.4a85.24,85.24,0,0,0-57.94-55.51,8,8,0,0,0-4,15.49A69.3,69.3,0,0,1,198,212.8a8,8,0,0,0,11.31-11.31Z"></path>
  </svg>
);

export default OrderTracker;