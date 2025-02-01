const express = require('express');
const jwt = require('jsonwebtoken');

const authController = require('../controllers/auth');
const authMiddlewares = require('../middlewares/auth');
const Blt = require('../models/blackListedToken')

const router = express.Router();

// localhost:<port>/signup => POST
router.post('/signup', authController.signup);

// localhost:<port>/login => POST
router.post('/login', authController.login);

// localhost:<port>/logout => POST
router.post('/logout', authController.logout, authMiddlewares.cleanBlackListedTokens);

module.exports = router;
