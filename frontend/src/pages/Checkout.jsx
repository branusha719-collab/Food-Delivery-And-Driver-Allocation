import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

const Checkout = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const taxes = cartTotal * 0.1;
  const deliveryFee = 3.50;
  const grandTotal = cartTotal + taxes + deliveryFee;

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    // Simulate real order placement
    try {
      // Stub for real API
      /*
      const response = await axios.post('http://localhost:5000/api/orders', {
        restaurantId: 1, // Mock
        items: cart,
        totalAmount: grandTotal,
        deliveryAddress: { coordinates: [0, 0] }
      });
      const orderId = response.data.data._id;
      */
      
      // Mock flow
      setTimeout(() => {
        const orderId = Math.floor(Math.random() * 1000000);
        clearCart();
        navigate(`/order/${orderId}`);
      }, 1500);
      
    } catch (error) {
      console.error(error);
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
