import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const taxes = cartTotal * 0.1;
  const deliveryFee = 3.50;
  const grandTotal = cartTotal + taxes + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!token) {
      setError("Please sign in to place an order.");
      return;
    }

    // Check if cart has items from a real restaurant
    const restaurantId = cart[0]?._restaurantId;
    if (!restaurantId || !/^[a-f0-9]{24}$/i.test(restaurantId)) {
      setError("Cannot place order: Cart contains mock items. Please select items from a real restaurant.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Group quantities if there are duplicate items in cart
      const itemMap = {};
      cart.forEach(item => {
        const id = item._mongoId || item.id;
        if (!itemMap[id]) itemMap[id] = 0;
        itemMap[id] += 1;
      });

      const orderItems = Object.keys(itemMap).map(id => ({
        menuItemId: id,
        quantity: itemMap[id]
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurantId,
          deliveryAddress: "742 Evergreen Terrace, Penthouse B, Springfield, 12345",
          items: orderItems
        })
      });

      const data = await response.json();
      
      if (data.success) {
        clearCart();
        navigate(`/order/${data.data._id}`);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while placing your order.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page empty-cart">
        <h2>Your cart is empty.</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Explore Restaurants</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-details">
          <h2>Checkout</h2>
          
          <div className="checkout-section card-level-1">
            <h3>Delivery Address</h3>
            <p className="address-text">742 Evergreen Terrace, Penthouse B<br/>Springfield, 12345</p>
            <p className="delivery-instructions">Leave at the door.</p>
          </div>
          
          <div className="checkout-section card-level-1">
            <h3>Payment Method</h3>
            <div className="payment-method">
              <span className="card-icon">💳</span>
              <span>•••• •••• •••• 4242</span>
            </div>
          </div>
        </div>

        <div className="checkout-summary card-level-1">
          <h3>Order Summary</h3>
          {error && <div style={{ color: 'var(--destructive)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>{error}</div>}
          <div className="summary-items">
            {cart.map((item, index) => (
              <div key={index} className="summary-item">
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-calc">
            <div className="calc-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Taxes & Fees</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary place-order-btn" 
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Place Order • $${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
