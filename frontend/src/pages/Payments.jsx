import React, { useState } from 'react';
import { CreditCard, Plus, Trash, CheckCircle, Bank, CurrencyDollar } from '@phosphor-icons/react';
import './ProfilePages.css';

const MOCK_PAYMENTS = [
  { id: 1, type: 'card', label: 'Visa ending in 4242', expiry: '12/28', isDefault: true },
  { id: 2, type: 'card', label: 'Mastercard ending in 8888', expiry: '03/27', isDefault: false },
  { id: 3, type: 'upi', label: 'john@okaxis', isDefault: false },
];

const Payments = () => {
  const [methods, setMethods] = useState(MOCK_PAYMENTS);
  const [showAddForm, setShowAddForm] = useState(false);

  const setDefault = (id) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const removeMethod = (id) => {
    setMethods(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Payment Methods</h1>
        <p className="subtitle">Manage your saved cards, UPI, and wallets</p>
      </div>

      <div className="payments-list">
        {methods.map(method => (
          <div key={method.id} className={`payment-card ${method.isDefault ? 'default' : ''}`}>
            <div className="payment-icon">
              {method.type === 'card' ? <CreditCard size={28} weight="duotone" /> : <Bank size={28} weight="duotone" />}
            </div>
            <div className="payment-details">
              <span className="payment-label">{method.label}</span>
              {method.expiry && <span className="payment-expiry">Expires {method.expiry}</span>}
              {method.isDefault && <span className="payment-default-badge"><CheckCircle size={14} weight="fill" /> Default</span>}
            </div>
            <div className="payment-actions">
              {!method.isDefault && (
                <button className="btn-set-default" onClick={() => setDefault(method.id)}>Set Default</button>
              )}
              <button className="btn-remove-payment" onClick={() => removeMethod(method.id)}>
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showAddForm ? (
        <button className="btn-add-payment" onClick={() => setShowAddForm(true)}>
          <Plus size={18} /> Add Payment Method
        </button>
      ) : (
        <div className="add-payment-form">
          <h3>Add New Card</h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>Card Number</label>
              <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} />
            </div>
            <div className="form-field">
              <label>Expiry Date</label>
              <input type="text" placeholder="MM/YY" maxLength={5} />
            </div>
            <div className="form-field">
              <label>CVV</label>
              <input type="text" placeholder="•••" maxLength={4} />
            </div>
            <div className="form-field full-width">
              <label>Name on Card</label>
              <input type="text" placeholder="John Doe" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save">Save Card</button>
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="wallet-section">
        <h2>Foodgy Wallet</h2>
        <div className="wallet-card">
          <div className="wallet-balance">
            <CurrencyDollar size={28} weight="bold" />
            <div>
              <span className="wallet-amount">$24.50</span>
              <span className="wallet-label">Available Balance</span>
            </div>
          </div>
          <button className="btn-add-money">+ Add Money</button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
