const express = require('express');

const costumerController = require('../controllers/costumer')

const router = express.Router();

// localhost:<port>/products => GET
router.get('/products', costumerController.getProducts);

// localhost:<port>/product/<productId> => GET
router.get('/product/:prodId', costumerController.getProduct);

module.exports = router;
