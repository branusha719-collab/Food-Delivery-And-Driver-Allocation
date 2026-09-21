import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, Trash } from '@phosphor-icons/react';
import './Checkout.css';

const Checkout = ({ cart, clearCart, removeFromCart, updateQuantity }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxes = cartTotal * 0.1;
  const deliveryFee = 3.50;
  const grandTotal = cartTotal + taxes + deliveryFee;

  const defaultAddressObj = (() => {
    try {
      const saved = localStorage.getItem('demo_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        const def = parsed.find(a => a.isDefault) || parsed[0];
        if (def) return def;
      }
    } catch(e) {}
    return { label: 'Home', address: "742 Evergreen Terrace, Penthouse B", city: "Springfield", zip: "12345" };
  })();
  const fullAddressString = `${defaultAddressObj.address}, ${defaultAddressObj.city}, ${defaultAddressObj.zip}`;

  const handlePlaceOrder = async () => {
    let restaurantId = cart[0]?._restaurantId;
    if (!restaurantId || !/^[a-f0-9]{24}$/i.test(restaurantId)) {
      restaurantId = "6ab0e2c724c42752d6f1b0ff";
    }

    setLoading(true);
    setError(null);
    
    try {
      const orderItems = cart.map(item => ({
        menuItemId: item._mongoId || item.id,
        quantity: item.quantity
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurantId,
          deliveryAddress: fullAddressString,
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
            <p className="address-text">{defaultAddressObj.address}<br/>{defaultAddressObj.city}, {defaultAddressObj.zip}</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Order Summary</h3>
            {cart.length > 0 && <button onClick={clearCart} style={{ color: 'var(--destructive, #ef4444)', fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none' }}>Clear Cart</button>}
          </div>
          {error && <div style={{ color: 'var(--destructive, #ef4444)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>{error}</div>}
          <div className="summary-items">
            {cart.map((item, index) => (
              <div key={index} className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
                <div style={{ flex: 1 }}>
                  <span className="item-name" style={{ fontWeight: 600 }}>{item.name}</span>
                  <div style={{ color: 'var(--muted, #888)', fontSize: '0.8rem', marginTop: '2px' }}>₹{item.price.toFixed(2)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Quantity controls like Swiggy/Zomato */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--primary, #f97316)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button 
                      onClick={() => updateQuantity(index, -1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--primary, #f97316)', display: 'flex', alignItems: 'center' }}
                    >
                      <Minus size={14} weight="bold" />
                    </button>
                    <span style={{ padding: '4px 10px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary, #f97316)', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(index, 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--primary, #f97316)', display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={14} weight="bold" />
                    </button>
                  </div>
                  <span className="item-price" style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button 
                    onClick={() => removeFromCart(index)} 
                    style={{ color: 'var(--destructive, #ef4444)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: '4px' }}
                    title="Remove item"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-calc">
            <div className="calc-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Taxes & Fees</span>
              <span>₹{taxes.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary place-order-btn" 
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Place Order • ₹${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
