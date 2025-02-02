const express = require('express');

const authController = require('../controllers/auth');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();
// TODO: Still need to implement getting a reset password link request
// and a post reset password request

// localhost:<port>/signup => POST
router.post('/signup', authController.signup);

// localhost:<port>/login => POST
router.post('/login', authController.login);

// localhost:<port>/logout => POST
router.post('/logout', authController.logout, authMiddlewares.cleanBlackListedTokens);

module.exports = router;
