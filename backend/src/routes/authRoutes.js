const express = require('express');

const authController = require('../controllers/authController');
const validateRequest = require('../middleware/requestValidator');
const {
  registerValidator,
  loginValidator
} = require('../validators/authValidator');

const router = express.Router();

router.post(
  '/register',
  registerValidator,
  validateRequest,
  authController.register
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  authController.login
);

module.exports = router;