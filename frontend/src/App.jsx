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

function App() {
  const [cart, setCart] = useState([])

  const addToCart = (item) => {
    setCart([...cart, item])
  }

  const clearCart = () => setCart([])

  return (
    <div className="app-container">
      <Header cartCount={cart.length} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<Restaurant cart={cart} addToCart={addToCart} clearCart={clearCart} />} />
          <Route path="/order/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          <Route path="/order/:id" element={<OrderTracker />} />
          
          {/* Profile Routes */}
          <Route path="/profile/orders" element={<Orders />} />
          <Route path="/profile/favorites" element={<Favorites />} />
          <Route path="/profile/payments" element={<Payments />} />
          <Route path="/profile/addresses" element={<Addresses />} />
          <Route path="/profile/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
