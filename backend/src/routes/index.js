const express = require('express');
const router = express.Router();

const orderRoutes = require('./orderRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const menuRoutes = require('./menuRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/orders', orderRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/health', healthRoutes);

module.exports = router;
