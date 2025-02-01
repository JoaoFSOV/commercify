const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	email: { type: String, required: true },
	name: { type: String, required: true },
	password: { type: String, required: true },
	resetToken: String,
	resetTokenExpiration: Date,
	cart: {
		products: [
			{
				productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
				quantity: { type: Number, required: true }
			}
		]
	}
});

module.exports = mongoose.model('User', userSchema);
