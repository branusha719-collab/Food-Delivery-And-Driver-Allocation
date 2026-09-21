import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Restaurant from './pages/Restaurant'
import Checkout from './pages/Checkout'
import OrderTracker from './pages/OrderTracker'
import Orders from './pages/Orders'
import Favorites from './pages/Favorites'
import Payments from './pages/Payments'
import Addresses from './pages/Addresses'
import Settings from './pages/Settings'
import DriverDashboard from './pages/DriverDashboard'
import DriverLogin from './pages/DriverLogin'

function App() {
  // Cart is now an array of { ...item, quantity: N }
  const [cart, setCart] = useState([])

  // In-app modal state for cross-restaurant warning
  const [crossRestaurantModal, setCrossRestaurantModal] = useState({ open: false, pendingItem: null })

  const addToCart = (item) => {
    // Handle decrement from restaurant page qty controls
    if (item._delta === -1) {
      const itemId = item._mongoId || item.id;
      const existingIndex = cart.findIndex(ci => (ci._mongoId || ci.id) === itemId);
      if (existingIndex >= 0) {
        const updated = [...cart];
        const newQty = updated[existingIndex].quantity - 1;
        if (newQty <= 0) {
          updated.splice(existingIndex, 1);
        } else {
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        }
        setCart(updated);
      }
      return;
    }

    if (cart.length > 0) {
      const currentRestaurantId = cart[0]._restaurantId;
      if (currentRestaurantId && item._restaurantId && currentRestaurantId !== item._restaurantId) {
        // Show in-app modal instead of window.confirm
        setCrossRestaurantModal({ open: true, pendingItem: item });
        return;
      }
    }

    // Check if item already exists in cart — increment quantity
    const existingIndex = cart.findIndex(
      ci => (ci._mongoId || ci.id) === (item._mongoId || item.id)
    );
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + 1 };
      setCart(updated);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  }

  const handleCrossRestaurantConfirm = () => {
    const item = crossRestaurantModal.pendingItem;
    setCrossRestaurantModal({ open: false, pendingItem: null });
    setCart([{ ...item, quantity: 1 }]);
  }

  const handleCrossRestaurantCancel = () => {
    setCrossRestaurantModal({ open: false, pendingItem: null });
  }

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index] = { ...updated[index], quantity: newQty };
    }
    setCart(updated);
  }

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  }

  const clearCart = () => setCart([])

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      <Header cartCount={cartItemCount} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<Restaurant cart={cart} addToCart={addToCart} clearCart={clearCart} />} />
          <Route path="/order/checkout" element={<Checkout cart={cart} clearCart={clearCart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
          <Route path="/order/:id" element={<OrderTracker />} />
          
          {/* Profile Routes */}
          <Route path="/profile/orders" element={<Orders />} />
          <Route path="/profile/favorites" element={<Favorites />} />
          <Route path="/profile/payments" element={<Payments />} />
          <Route path="/profile/addresses" element={<Addresses />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Routes>
      </main>

      {/* In-app cross-restaurant modal */}
      {crossRestaurantModal.open && (
        <div className="modal-overlay" onClick={handleCrossRestaurantCancel}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.5rem' }}>Replace cart items?</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Your cart contains items from another restaurant. Would you like to clear your cart and add this item instead?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={handleCrossRestaurantCancel}>No, keep current</button>
              <button className="btn-primary" onClick={handleCrossRestaurantConfirm} style={{ padding: '8px 20px', borderRadius: '8px' }}>Yes, start fresh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
