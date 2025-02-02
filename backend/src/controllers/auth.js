const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user');
const Blt = require('../models/blackListedToken');
const errorUtil = require('../util/error');

// Creates the user in the database
exports.signup = async (req, res, next) => {
	const { email, password, name } = req.body;

	try {
		const user = await User.findOne({ email: email });
		if(user) return next(errorUtil.prepError('Email already in use.', 409));

		const hashedPassword = await bcrypt.hash(password, 12);
		const newUser = new User({
			email: email,
			name: name,
			password: hashedPassword,
		});

		await newUser.save();
		res.status(201).json({ message: 'Signup successfull!' });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Verifies password and creates a jwt and sets it in a secure cookie called jwt_token
exports.login = async (req, res, next) => {
	const email = req.body.email;

	try{
		const user = await User.findOne({ email: email });
		if(!user) return next(errorUtil.prepError(`No account found with email = ${email}.`, 404));

		const isEqual = await bcrypt.compare(req.body.password, user.password);
		if(!isEqual) return next(errorUtil.prepError('Wrong credentials.', 401));

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
	}catch (err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Saves the token in the database to be handled as blacklisted and removes it from cookie
exports.logout = async (req, res, next) => {
	const token = req.cookies.jwt_token;				

	try{
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const blt = new Blt({
			token: token,
			expiresAt: new Date(decoded.exp * 1000)
		});

		await blt.save();
		res.clearCookie('jwt_token');
		res.status(200).json({ message: 'Logged out successfully' });
		next();
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};
