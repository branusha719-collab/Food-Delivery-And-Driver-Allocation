const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const validateRequest = require('../middleware/requestValidator');
const { menuItemIdParamValidator } = require('../validators/menuValidator');

// GET /api/menu/:id - Get single menu item details
router.get('/:id', menuItemIdParamValidator, validateRequest, menuController.getMenuItemById);

module.exports = router;
