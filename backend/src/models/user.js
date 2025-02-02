const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	email: { type: String, required: true },
	name: { type: String, required: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['admin', 'customer'], default: 'customer'},
	resetToken: String,
	resetTokenExpiration: Date,
	cart: {
		products: [
			{
				prodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
				quantity: { type: Number, required: true }
			}
		]
	}
});

userSchema.methods.addToCart = function(product, quantity) {
	const productIndex = this.cart.products.findIndex(cp => {
		return cp.prodId.toString() === product._id.toString();
	});

	if(productIndex >= 0){
		this.cart.products[productIndex].quantity += quantity;
	}else {
		const newCartProduct = { prodId: product._id, quantity: quantity };
		this.cart.products.push(newCartProduct);
	}

	this.save();
};

module.exports = mongoose.model('User', userSchema);
