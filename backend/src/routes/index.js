const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const menuRoutes = require('./menuRoutes');
const healthRoutes = require('./healthRoutes');
const driverRoutes = require('./driverRoutes');

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/health', healthRoutes);
router.use('/drivers', driverRoutes);

module.exports = router;