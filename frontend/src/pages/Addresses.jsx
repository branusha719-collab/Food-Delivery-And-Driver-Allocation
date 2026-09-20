import React, { useState } from 'react';
import { MapPin, Plus, PencilSimple, Trash, House, Briefcase, MapTrifold, CheckCircle } from '@phosphor-icons/react';
import './ProfilePages.css';

const MOCK_ADDRESSES = [
  { id: 1, type: 'home', label: 'Home', address: '742 Evergreen Terrace', city: 'Springfield', zip: '62704', isDefault: true },
  { id: 2, type: 'work', label: 'Work', address: '123 Fake Street, Suite 400', city: 'Springfield', zip: '62701', isDefault: false },
];

const Addresses = () => {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ type: 'home', label: '', address: '', city: '', zip: '' });

  const setDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const removeAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({ type: addr.type, label: addr.label, address: addr.address, city: addr.city, zip: addr.zip });
    setShowAddForm(true);
  };

  const saveAddress = () => {
    if (editingId) {
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
    } else {
      setAddresses(prev => [...prev, { id: Date.now(), ...formData, isDefault: prev.length === 0 }]);
    }
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ type: 'home', label: '', address: '', city: '', zip: '' });
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ type: 'home', label: '', address: '', city: '', zip: '' });
  };

  const getIcon = (type) => {
    if (type === 'home') return <House size={22} weight="duotone" />;
    if (type === 'work') return <Briefcase size={22} weight="duotone" />;
    return <MapTrifold size={22} weight="duotone" />;
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Saved Addresses</h1>
        <p className="subtitle">Manage your delivery addresses</p>
      </div>

      <div className="addresses-list">
        {addresses.map(addr => (
          <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
            <div className="address-icon">{getIcon(addr.type)}</div>
            <div className="address-details">
              <div className="address-label-row">
                <span className="address-type-label">{addr.label}</span>
                {addr.isDefault && <span className="address-default-tag"><CheckCircle size={14} weight="fill" /> Default</span>}
              </div>
              <span className="address-full">{addr.address}</span>
              <span className="address-city">{addr.city}, {addr.zip}</span>
            </div>
            <div className="address-actions">
              {!addr.isDefault && (
                <button className="btn-set-default" onClick={() => setDefault(addr.id)}>Set Default</button>
              )}
              <button className="btn-edit-addr" onClick={() => startEdit(addr)}><PencilSimple size={16} /></button>
              <button className="btn-remove-addr" onClick={() => removeAddress(addr.id)}><Trash size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {!showAddForm ? (
        <button className="btn-add-payment" onClick={() => { setEditingId(null); setFormData({ type: 'home', label: '', address: '', city: '', zip: '' }); setShowAddForm(true); }}>
          <Plus size={18} /> Add New Address
        </button>
      ) : (
        <div className="add-payment-form">
          <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="address-type-picker">
            {['home', 'work', 'other'].map(t => (
              <button key={t} className={`type-btn ${formData.type === t ? 'active' : ''}`} onClick={() => setFormData({ ...formData, type: t })}>
                {t === 'home' && <House size={16} />}
                {t === 'work' && <Briefcase size={16} />}
                {t === 'other' && <MapTrifold size={16} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>Label</label>
              <input type="text" placeholder="e.g. Mom's House" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} />
            </div>
            <div className="form-field full-width">
              <label>Full Address</label>
              <input type="text" placeholder="Street address, apartment, etc." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="form-field">
              <label>City</label>
              <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            </div>
            <div className="form-field">
              <label>ZIP Code</label>
              <input type="text" placeholder="ZIP" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={saveAddress}>Save Address</button>
            <button className="btn-cancel" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
