const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const Blt = require('../models/blackListedToken');
const errorUtil = require('../util/error');

const isProduction = process.env.NODE_ENV === 'production'

// Dev only, for production check their Email API/SMTP
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "af836a87a1e83f",
    pass: "b70cca216bf7a7"
  }
});

// Creates the user in the database
exports.signup = async (req, res, next) => {
	const { email, password, name } = req.body;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

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
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.login = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	try{
		const user = await User.findOne({ email: email });
		if(!user) return next(errorUtil.prepError(`No account found with email = ${email}.`, 404));

		const isEqual = await bcrypt.compare(password, user.password);
		if(!isEqual) return next(errorUtil.prepError('Wrong credentials.', 401));

		// Creates the jwt token
		const jwtToken = jwt.sign({ 
			userId: user._id.toString(),
		}, process.env.JWT_SECRET, { expiresIn: '1h'});

		// Writes it into a secure cookie called jwt_token to be sent with every request
		res.cookie('jwt_token', jwtToken, {
			httpOnly: true,       // Cannot be access via JS
			secure: isProduction, // Only sent over HTTPS
			sameSite: 'Strict',   // Prevents csrf attacks from other sites
			maxAge: 3600 * 1000   // 1h (matches token expiration)
		});

		res.status(200).json({ message: 'Login successfull.' });
	}catch (err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Get current logged in user info
exports.getMe = async (req, res, next) => {
	const userId = req.userId;
	try {
		const user = await User.findById(userId).select('_id name email role');
		if(!user) return next(errorUtil.prepError(`User not found.`, 404));

		res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, isAdmin: user.role === 'admin' } });
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.logout = async (req, res, next) => {
	const token = req.cookies.jwt_token;				

	try{
		// Black lists the token (adds it to the database blacklist collection) so no more requests can be done using 
		// this token even if inside the 1h expiration date
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const blt = new Blt({
			token: token,
			expiresAt: new Date(decoded.exp * 1000)
		});

		await blt.save();

		// Removes it from the cookie
		res.clearCookie('jwt_token');
		res.status(200).json({ message: 'Logged out successfully' });
		next();
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.sendForgotPasswordEmail = async (req, res, next) =>{
	const email = req.body.email;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	try {
		const user = await User.findOne({ email: email });
		if(!user) return next(errorUtil.prepError(`No account found with email = ${email}`, 404));

		// Creates a random tooken
		const token = crypto.randomBytes(32).toString('hex');

		// Sets it in the user model with a expiration date too 
		user.resetToken = token;
		user.resetTokenExpiration = Date.now() + 3600 * 1000; 
		await user.save();

		// Creates an email with a link with that token for a frontend url page that would contain the reset form 
		// Could have implmemented by sending and email with the password reset form
		const msg = {
			to: email,
			from: process.env.EMAIL_SENDER,
			subject: 'Reseting your password',
			html: `
			<p>You requested a password reset!</p>
			<p>Click the link below to reset your password:</p>
			<p><a href="${process.env.FRONTEND_URL}/reset/${token}">Reset your password!</a></p>
			`,
		}
		await transport.sendMail(msg); // Send the email in development it is catched by email trap 
		res.status(200).json({ message: 'Reset password email sent.' });

	}catch (err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.resetPassword = async (req, res, next) => {
	const { password, token } = req.body;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });
	
	try {
		// Gets the user with that token and in which it hasnt expired
		const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }});
		if(!user) return next(errorUtil.prepError(`Invalid or expired token.`, 403));

		// Changes its password
		const hashedPassword = await bcrypt.hash(password, 12);
		user.password = hashedPassword;
		user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
		await user.save();

		res.status(200).json({ message: 'Password reset successfull!' });
	}catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};
