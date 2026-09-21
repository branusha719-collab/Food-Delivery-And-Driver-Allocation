/**
 * Standardized API Response Helpers
 */

/**
 * Sends a standardized success JSON response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} data
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    errorCode: null,
    data
  });
};

/**
 * Sends a standardized error JSON response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {string} errorCode
 * @param {any} [details=null]
 */
const sendError = (res, statusCode = 500, message = 'An error occurred', errorCode = 'INTERNAL_SERVER_ERROR', details = null) => {
  const payload = {
    success: false,
    message,
    errorCode,
    data: null
  };

  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError
};
