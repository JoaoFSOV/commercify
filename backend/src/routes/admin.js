const express = require("express");
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// localhost:<port>/create-product => POST
router.post('/create-product',
	[
		body('name', 'Name as to be at least 5 caracters long.').isString().isLength({ min: 5 }).trim(),
		body('price').isFloat({ min: 0 }).withMessage('Price must be a positive integer.'),
		body('description', 'Product description must be at least 5 caracters long.').isString().isLength({ min: 5 }).trim(),
		body('type').isString()
		.isIn(['tech', 'household', 'clothing', 'beauty', 'sports'])
		.withMessage('Type must be one of: tech, household, clothing, beauty, sports.'),
		body('brand', 'Brand must be at least 2 caracters long.').isString().isLength({ min: 2 }).trim(),
		body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer.'),
		body('discount').isInt({ min: 0, max: 100 }).withMessage('Discount must be a integer value between 0 and 100'),
		body('imageUrl', 'Use a real URL for the product image.').isURL()
	],
	authMiddleware.isAdmin, adminController.createProduct);

// localhost:<port>/edit-product/<productId> => PUT
router.put('/edit-product/:prodId',
	[
		body('name', 'Name as to be at least 5 caracters long.').isString().isLength({ min: 5 }).trim(),
		body('price').isFloat({ min: 0 }).withMessage('Price must be a positive integer.'),
		body('description', 'Product description must be at least 5 caracters long.').isString().isLength({ min: 5 }).trim(),
		body('type').isString()
		.isIn(['tech', 'household', 'clothing', 'beauty', 'sports'])
		.withMessage('Type must be one of: tech, household, clothing, beauty, sports.'),
		body('brand', 'Brand must be at least 2 caracters long.').isString().isLength({ min: 2 }).trim(),
		body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer.'),
		body('discount').isInt({ min: 0, max: 100 }).withMessage('Discount must be a integer value between 0 and 100'),
		body('imageUrl', 'Use a real URL for the product image.').isURL()
	],
	authMiddleware.isAdmin, adminController.editProduct);

// localhost:<port>/delete-product/<productId> => DELETE
router.delete('/delete-product/:prodId', authMiddleware.isAdmin, adminController.deleteProduct);

// localhost:<port>/promote => PUT
router.put('/promote/:userId', authMiddleware.isAdmin, adminController.promote);

module.exports = router;
