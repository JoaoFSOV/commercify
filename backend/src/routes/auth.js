const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const authMiddlewares = require('../middlewares/auth');
const User = require('../models/user');

const router = express.Router();

// localhost:<port>/signup => POST
router.post('/signup',
	[
		body('name', 'Name has to be at least 3 caracters long.').isString().isLength({ min: 3 }),
		body('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
			return User.findOne({email: value})
				.then(userDoc => {
					if(userDoc) {
						return Promise.reject('E-mail exists already, please pick a different one');
					}
				});
		}).normalizeEmail(),
		body('password', 'Please enter a password with only numbers and text and at least 5 characters.').isLength({ min: 5}).isAlphanumeric().trim(),
		body('confirmPassword').trim().custom((value, {req}) => {
			if(value !== req.body.password) 
				throw Error('Passwords have to match.');
			return true;
		})
	],
	authController.signup);

// localhost:<port>/login => POST
router.post('/login',
	[
		body('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
			return User.findOne({email: value})
				.then(userDoc => {
					if(!userDoc) {
						return Promise.reject('There is no account associated with this E-mail.');
					}
				});
		}).normalizeEmail(),
		body('password', 'Please enter a password with only numbers and text and at least 5 characters.').isLength({ min:5 }).isAlphanumeric().trim()
	],
	authController.login);

// localhost:<port>/me => GET
router.get('/me', authController.getMe);

// localhost:<port>/logout => POST
router.post('/logout', authController.logout, authMiddlewares.cleanBlackListedTokens);

// localhost:<port>/forgot => POST
router.post('/forgot',
	[
		body('email').isEmail().withMessage('Please enter a valid email').custom((value, {req}) => {
			return User.findOne({email: value})
				.then(userDoc => {
					if(!userDoc) {
						return Promise.reject('There is no account associated with this E-mail.');
					}
				});
		}).normalizeEmail(),
	],
	authController.sendForgotPasswordEmail);

// localhost:<port>/reset => POST
router.post('/reset',
	[
		body('password', 'Please enter a password with only numbers and text and at least 5 characters.').isLength({ min: 5}).isAlphanumeric().trim(),
		body('confirmPassword').trim().custom((value, {req}) => {
			if(value !== req.body.password) 
				throw Error('Passwords have to match.');
			return true;
		})
	],
	authController.resetPassword);

module.exports = router;
