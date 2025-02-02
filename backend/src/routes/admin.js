const express = require("express");

const User = require('../models/user');
const adminController = require('../controllers/admin');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// localhost:<port>/create-product => POST
router.post('/create-product', authMiddleware.isAdmin, adminController.createProduct);

// localhost:<port>/edit-product/<productId> => PUT
router.put('/edit-product/:prodId', authMiddleware.isAdmin, adminController.editProduct);

// localhost:<port>/delete-product/<productId> => DELETE
router.delete('/delete-product/:prodId', authMiddleware.isAdmin, adminController.deleteProduct);

// localhost:<port>/promote => PUT
router.put('/promote/:userId', authMiddleware.isAdmin, adminController.promote);

module.exports = router;
