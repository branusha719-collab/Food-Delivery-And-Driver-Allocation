const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { ALL_ORDER_STATUSES } = require('../utils/orderStatus');

const isValidMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

const createOrderValidator = [
  body('restaurantId')
    .trim()
    .notEmpty()
    .withMessage('restaurantId is required')
    .custom(isValidMongoId)
    .withMessage('restaurantId must be a valid MongoDB ObjectId'),
  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('deliveryAddress is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),
  body('items.*.menuItemId')
    .trim()
    .notEmpty()
    .withMessage('menuItemId is required for each item')
    .custom(isValidMongoId)
    .withMessage('Each menuItemId must be a valid MongoDB ObjectId'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than or equal to 1')
];

const updateStatusValidator = [
  param('id')
    .trim()
    .custom(isValidMongoId)
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('status is required')
    .isIn(ALL_ORDER_STATUSES)
    .withMessage(`status must be one of: ${ALL_ORDER_STATUSES.join(', ')}`)
];

const assignDriverValidator = [
  param('id')
    .trim()
    .custom(isValidMongoId)
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('driverId')
    .trim()
    .notEmpty()
    .withMessage('driverId is required')
];

const orderIdParamValidator = [
  param('id')
    .trim()
    .custom(isValidMongoId)
    .withMessage('Order ID must be a valid MongoDB ObjectId')
];

const listOrdersQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('status')
    .optional()
    .isIn(ALL_ORDER_STATUSES)
    .withMessage(`status filter must be one of: ${ALL_ORDER_STATUSES.join(', ')}`),
  query('restaurantId')
    .optional()
    .custom(isValidMongoId)
    .withMessage('restaurantId filter must be a valid MongoDB ObjectId'),
  query('customerId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('customerId filter cannot be empty if provided'),
  query('driverId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('driverId filter cannot be empty if provided'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalAmount', 'subtotal', 'status'])
    .withMessage('sortBy must be one of: createdAt, totalAmount, subtotal, status'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be "asc" or "desc"')
];

module.exports = {
  createOrderValidator,
  updateStatusValidator,
  assignDriverValidator,
  orderIdParamValidator,
  listOrdersQueryValidator
};
