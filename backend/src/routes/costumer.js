const express = require('express');
const { body } = require('express-validator');

const costumerController = require('../controllers/costumer');

const router = express.Router();

// localhost:<port>/products => GET
router.get('/products', costumerController.getProducts);

// localhost:<port>/product/<productId> => GET
router.get('/product/:slug', costumerController.getProduct);

// localhost:<port>/rate-product/<productId> => POST
router.post('/rate-product/:prodId',
	[
		body('rating', 'Rating has to be a number between 0 and 5.').isFloat({ min: 0, max: 5 })
	],
	costumerController.rateProduct);

// localhost:<port>/cart => GET
router.get('/cart', costumerController.getCart);

// localhost:<port>/add-to-cart/<productId> => POST
router.post('/add-to-cart/:prodId',
	[
		body('quantity', 'Quantity has to be a positive integer value.').isInt({ min: 0 })
	],
	costumerController.addToCart);

// localhost:<port>/remove-from-cart/<productId> => DELETE
router.delete('/remove-from-cart/:prodId',
	[
		body('quantity', 'Quantity has to be a positive integer value.').isInt({ min: 0 })
	], 
	costumerController.removeFromCart);

// localhost:<port>/orders => GET
router.get('/orders', costumerController.getUserOrders);

// localhost:<port>/checkout => GET
router.get('/checkout', costumerController.checkout);

// localhost:<port>/checkout/success => GET
router.get('/checkout/success', costumerController.getCheckoutSuccess);

module.exports = router;
