const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user');
const Blt = require('../models/blackListedToken');

// Creates the user in the database
exports.signup = async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if(user) return res.status(409).json({ error: 'Email already in use.'});

	const hashedPassword = await bcrypt.hash(req.body.password, 12);
	const newUser = new User({
		email: req.body.email,
		name:  req.body.name,
		password: hashedPassword
	});

	try {
		await newUser.save();
		res.status(201).json({ message: 'Signup successfull!' });
	} catch(err) {
		const error = new Error(err);
		error.statusCode = 500;
		return next(error);
	}
};

// Verifies password and creates a jwt and sets it in a secure cookie called jwt_token
exports.login = async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if(!user) return res.status(404).json({ error: 'No account with that email was found.'});

	const isEqual = await bcrypt.compare(req.body.password, user.password);
	if(!isEqual) return res.status(401).json({ error: 'Wrong credentials.'});

	const jwtToken = jwt.sign({ 
		userId: user._id.toString(),
		jId: crypto.randomUUID().toString()
	}, process.env.JWT_SECRET, { expiresIn: '1h'});
	
	res.cookie('jwt_token', jwtToken, {
		httpOnly: true,       // Cannot be access via JS
		secure: true,         // Only sent over HTTPS
		sameSite: 'Strict',   // Prevents csrf attacks from other sites
		maxAge: 3600 * 1000   // 1h (matches token expiration)
	});

	res.status(200).json({ message: 'Login successfull.' });
};

// Saves the tokenId (jti) in the database to be handled as blacklisted and removes it from cookie
exports.logout = async (req, res, next) => {
	const token = req.cookies.jwt_token;				
	try{
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const blt = new Blt({
			jId: decoded.jId,
			userId: decoded.userId,
			expiresAt: new Date(decoded.exp * 1000)
		});

		try {
			await blt.save();
			res.clearCookie('jwt_token');
			res.status(200).json({ message: 'Logged out successfully' });
		}catch(err) {
			return res.status(500).json({ error: 'Error blacklisting the token' });
		}

	} catch(err) {
		return res.status(400).json({ error: 'Invalid token' });
	}
};
