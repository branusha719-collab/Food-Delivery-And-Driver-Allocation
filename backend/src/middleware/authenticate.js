const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  // Demo mode: Bypass authentication entirely and mock an admin user
  req.user = {
    id: 'demo-user-id',
    role: 'admin',
    email: 'admin@foodgy.com',
    restaurantId: '6ab0e2c724c42752d6f1b0ff' // Default Golden Gate just in case
  };
  
  // If a driverId is passed in query, assume driver role
  if (req.query.driverId) {
    req.user.role = 'driver';
    req.user.driverId = req.query.driverId;
  }
  
  next();
};

module.exports = authenticate;