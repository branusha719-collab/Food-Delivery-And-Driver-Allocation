import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Restaurant from './pages/Restaurant'
import Checkout from './pages/Checkout'
import OrderTracker from './pages/OrderTracker'

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
        </Routes>
      </main>
    </div>
  )
}

export default App
