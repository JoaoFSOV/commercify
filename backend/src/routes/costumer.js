const express = require('express');

const costumerController = require('../controllers/costumer');

const router = express.Router();

// localhost:<port>/products => GET
router.get('/products', costumerController.getProducts);

// localhost:<port>/product/<productId> => GET
router.get('/product/:slug', costumerController.getProduct);

// localhost:<port>/rate-product/<productId> => POST
router.post('/rate-product/:prodId', costumerController.rateProduct);

// localhost:<port>/cart => GET
router.get('/cart', costumerController.getCart);

// localhost:<port>/add-to-cart/<productId> => POST
router.post('/add-to-cart/:prodId', costumerController.addToCart);

// localhost:<port>/remove-from-cart/<productId> => DELETE
router.delete('/remove-from-cart/:prodId', costumerController.removeFromCart);

module.exports = router;
