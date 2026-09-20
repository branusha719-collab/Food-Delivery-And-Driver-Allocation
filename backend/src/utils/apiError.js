/**
 * Standardized Custom API Error class
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 404, 409, 500, etc.)
   * @param {string} message - Human-readable error description
   * @param {string} [errorCode=null] - Standardized application error code
   * @param {any} [details=null] - Optional additional error metadata/validation errors
   */
  constructor(statusCode, message, errorCode = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
