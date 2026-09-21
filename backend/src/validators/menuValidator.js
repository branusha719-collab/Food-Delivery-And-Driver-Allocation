const { param, query } = require('express-validator');
const mongoose = require('mongoose');

const isValidMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

const restaurantMenuValidator = [
  param('restaurantId')
    .trim()
    .custom(isValidMongoId)
    .withMessage('restaurantId must be a valid MongoDB ObjectId'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['price', 'name', 'createdAt', 'category'])
    .withMessage('sortBy must be one of: price, name, createdAt, category'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be "asc" or "desc"')
];

const menuItemIdParamValidator = [
  param('id')
    .trim()
    .custom(isValidMongoId)
    .withMessage('Menu item ID must be a valid MongoDB ObjectId')
];

module.exports = {
  restaurantMenuValidator,
  menuItemIdParamValidator
};
