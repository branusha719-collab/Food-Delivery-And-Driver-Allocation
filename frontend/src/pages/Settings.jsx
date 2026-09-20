import React, { useState } from 'react';
import { User, Bell, Moon, Globe, ShieldCheck, Eye, PencilSimple, Check } from '@phosphor-icons/react';
import './ProfilePages.css';

const Settings = () => {
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john.doe@email.com', phone: '+1 (555) 123-4567' });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [notifications, setNotifications] = useState({ orders: true, promos: true, recommendations: false, sms: false });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const startEdit = (field) => {
    setEditingField(field);
    setTempValue(profile[field]);
  };

  const saveEdit = () => {
    setProfile(prev => ({ ...prev, [editingField]: tempValue }));
    setEditingField(null);
    setTempValue('');
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <div className="settings-section">
        <h2 className="settings-section-title"><User size={20} /> Profile Information</h2>
        <div className="settings-card">
          {['name', 'email', 'phone'].map(field => (
            <div key={field} className="settings-row">
              <div className="settings-row-label">{field.charAt(0).toUpperCase() + field.slice(1)}</div>
              {editingField === field ? (
                <div className="settings-row-edit">
                  <input type="text" value={tempValue} onChange={e => setTempValue(e.target.value)} className="settings-input" autoFocus />
                  <button className="btn-save-sm" onClick={saveEdit}><Check size={16} /></button>
                </div>
              ) : (
                <div className="settings-row-value">
                  <span>{profile[field]}</span>
                  <button className="btn-edit-sm" onClick={() => startEdit(field)}><PencilSimple size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="settings-section">
        <h2 className="settings-section-title"><Bell size={20} /> Notifications</h2>
        <div className="settings-card">
          {[
            { key: 'orders', label: 'Order Updates', desc: 'Get notified about your order status' },
            { key: 'promos', label: 'Promotions & Offers', desc: 'Receive exclusive deals and discounts' },
            { key: 'recommendations', label: 'Recommendations', desc: 'Personalized restaurant suggestions' },
            { key: 'sms', label: 'SMS Notifications', desc: 'Receive updates via text message' },
          ].map(item => (
            <div key={item.key} className="settings-row toggle-row">
              <div>
                <div className="settings-row-label">{item.label}</div>
                <div className="settings-row-desc">{item.desc}</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications[item.key]} onChange={() => toggleNotification(item.key)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h2 className="settings-section-title"><Moon size={20} /> Appearance</h2>
        <div className="settings-card">
          <div className="settings-row toggle-row">
            <div>
              <div className="settings-row-label">Dark Mode</div>
              <div className="settings-row-desc">Switch to a darker color theme</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="settings-section">
        <h2 className="settings-section-title"><Globe size={20} /> Language</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-label">Preferred Language</div>
            <select className="settings-select" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="settings-section">
        <h2 className="settings-section-title"><ShieldCheck size={20} /> Privacy & Security</h2>
        <div className="settings-card">
          <button className="settings-action-btn">Change Password</button>
          <button className="settings-action-btn">Two-Factor Authentication</button>
          <button className="settings-action-btn">Download My Data</button>
          <button className="settings-action-btn danger">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
