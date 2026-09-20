const { validationResult } = require('express-validator');
const { ERROR_CODES } = require('../utils/errorCodes');

/**
 * Middleware to check express-validator results and format standardized error response
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const firstErrorMessage = errorList[0].msg;

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errorCode: ERROR_CODES.VALIDATION_ERROR,
      data: null,
      details: errorList.map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = validateRequest;
