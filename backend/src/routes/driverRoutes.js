const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driverController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/profile', driverController.getProfile);

router.patch('/availability', driverController.updateAvailability);

module.exports = router;