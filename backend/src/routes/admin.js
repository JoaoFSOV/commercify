const express = require("express");

const adminController = require('../controllers/admin');

const router = express.Router();

// localhost:<port>/create-product => POST
router.post('/create-product', adminController.createProduct);

// localhost:<port>/edit-product/<productId> => PUT
router.put('/edit-product/:prodId', adminController.editProduct);

// localhost:<port>/delete-product/<productId> => DELETE
router.delete('/delete-product/:prodId', adminController.deleteProduct);

module.exports = router;
