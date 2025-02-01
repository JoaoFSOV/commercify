const jwt = require('jsonwebtoken');

const Blt = require('../models/blackListedToken');

// Verifies and validates the token for most routes
exports.authenticate = async (req, res, next) => {
	// Routes that should be public no matter their method
	const publicRoutes = ['/login', '/signup'];
	if(publicRoutes.includes(req.path) || req.method === 'GET') {
		return next();
	}

	const token = req.cookies.jwt_token;
	if(!token) return res.status(401).json({ error: 'Authorization required.'});
	
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Check if token is blacklisted
		const blacklistEntry = await Blt.findOne({ jId: decoded.jId.toString() });
        if (blacklistEntry) {
            return res.status(403).json({ error: 'Token is blacklisted' });
        }

		req.user = decoded.userId;
		next();
	}catch(err) {
		return res.status(403).json({ error: 'Invalid or expired token' });
	}
};

// Cleans all black listed tokens that have expired already
exports.cleanBlackListedTokens = async (req, res, next) => {
	const now = new Date();
    await Blacklist.deleteMany({ expiresAt: { $lt: now } });
};
