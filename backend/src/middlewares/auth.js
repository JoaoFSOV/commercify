const jwt = require('jsonwebtoken');

const Blt = require('../models/blackListedToken');
const User = require('../models/user');
const errorUtil = require('../util/error');

// Verifies and validates the token for most routes
exports.authenticate = async (req, res, next) => {
	const token = req.cookies.jwt_token;

	// !Get method routes that should be public to non authenticated user
	const publicRoutes = ['/login', '/signup', '/forgot', '/reset'];
	// Get routes that should require authentication
	const privateGetRoutes = ['/me', '/cart', '/checkout', '/checkout/success', '/orders'];
	if(publicRoutes.includes(req.path) || (req.method === 'GET' && !privateGetRoutes.includes(req.path))) {
		return next();
	}

	// User non authenticated, should not have access
	if(!token) return next(errorUtil.prepError('Authorization required.', 401));

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Check if token is blacklisted
		const blacklistEntry = await Blt.findOne({ token: token });
		if (blacklistEntry) return next(errorUtil.prepError('Token is blacklisted.', 403));

		req.userId = decoded.userId;
		next();
	}catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Cleans all black listed tokens that have expired already
exports.cleanBlackListedTokens = async (req, res, next) => {
	const now = new Date();
	try {
		await Blt.deleteMany({ expiresAt: { $lt: now } });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Checks if the logged in user is an admin
exports.isAdmin = async (req, res, next) => {
	const user = await User.findOne({ _id: req.userId });
	if(!user) return next(errorUtil.prepError('User not found.', 404));

	// Only admin users should have access
	req.isAdmin = (user.role === 'admin');
	if(!req.isAdmin) return next(errorUtil.prepError('Not authorized', 401));

	next();
};
