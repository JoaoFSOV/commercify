const express = require('express');

const authController = require('../controllers/auth');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();

// localhost:<port>/signup => POST
router.post('/signup', authController.signup);

// localhost:<port>/login => POST
router.post('/login', authController.login);

// localhost:<port>/me => GET
router.get('/me', authController.getMe);

// localhost:<port>/logout => POST
router.post('/logout', authController.logout, authMiddlewares.cleanBlackListedTokens);

// localhost:<port>/forgot => POST
router.post('/forgot', authController.sendForgotPasswordEmail);

// localhost:<port>/reset => POST
router.post('/reset', authController.resetPassword);

module.exports = router;
