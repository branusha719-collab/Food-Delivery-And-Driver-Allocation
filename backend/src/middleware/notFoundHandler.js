const { ERROR_CODES } = require('../utils/errorCodes');

/**
 * 404 Route Not Found middleware
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    errorCode: ERROR_CODES.ROUTE_NOT_FOUND,
    data: null
  });
};

module.exports = notFoundHandler;
