const ApiError = require('../utils/apiError');
const { ERROR_CODES } = require('../utils/errorCodes');

/**
 * Centralized Express error-handling middleware
 * Ensures ALL error responses conform to standard JSON schema
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let details = err.details || null;

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
    errorCode = ERROR_CODES.INVALID_ID;
    details = { path: err.path, value: err.value };
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    details = err.errors;
  }

  // Log unexpected internal errors for diagnostics
  if (statusCode >= 500) {
    console.error('[Unhandled Server Error]:', err);
  }

  const responsePayload = {
    success: false,
    message,
    errorCode,
    data: null
  };

  if (details && process.env.NODE_ENV !== 'production') {
    responsePayload.details = details;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
