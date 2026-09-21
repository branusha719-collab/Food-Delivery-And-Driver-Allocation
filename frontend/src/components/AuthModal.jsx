import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} weight="bold" />
        </button>
        
        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
