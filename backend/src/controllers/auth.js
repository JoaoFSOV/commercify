const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
	const { email, password, name, confirmPassword } = req.body;
	if(password !== confirmPassword) return next(errorUtil.prepError("Passwords don't match.", 401));

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
			secure: isProduction, // Only sent over HTTPS
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

// Generates a token and saves it on the user model in the database with a expire data of 1h, and  sends a reset password email with that token
// The frontend is going to create a form to get the new password
exports.sendForgotPasswordEmail = async (req, res, next) =>{
	const email = req.body.email;

	try {
		const user = await User.findOne({ email: email });
		if(!user) return next(errorUtil.prepError(`No account found with email = ${email}`, 404));

		const token = crypto.randomBytes(32).toString('hex');

		user.resetToken = token;
		user.resetTokenExpiration = Date.now() + 3600 * 1000; 
		await user.save();

		const msg = {
			to: email,
			from: process.env.EMAIL_SENDER,
			subject: 'Reseting your password',
			html: `
			<p>You requested a password reset!</p>
			<p>Click the link below to reset your password:</p>
			<p><a href="${process.env.FRONTEND_URL}/reset/${token}">Reset your password!</a></p>
			`,
			// Ofc if this was a RESTAPI serving multiple clients i would want to server side render a html page with the form for password reset,
			// So that all the reset password flow would stay contained in the api
		}
		await transport.sendMail(msg);
		res.status(200).json({ message: 'Reset password email sent.' });

	}catch (err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// It gets the token sent by the client the one generated and inserted in the user model (database) and the new password, updating it
exports.resetPassword = async (req, res, next) => {
	const { password, confirmPassword, token } = req.body;

	if(password !== confirmPassword) return next(errorUtil.prepError("Passwords don't match.", 401));
	
	try {
		const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }});
		if(!user) return next(errorUtil.prepError(`Invalid or expired token.`, 400));

		const hashedPassword = await bcrypt.hash(password, 12);
		user.password = hashedPassword;
		user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
		await user.save();

		res.status(200).json({ message: 'Password reset successfull!' });
	}catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};
