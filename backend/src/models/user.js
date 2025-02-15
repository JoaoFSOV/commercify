const mongoose = require('mongoose');
const { Product } = require('./product');

const errorUtil = require('../util/error');

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
		],
		totalPrice: { type: Number, default: 0 }
	}
});

userSchema.methods.addToCart = async function(product, quantity) {
	let cartQuantity = 0;
	const productIndex = this.cart.products.findIndex(cp => {
		return cp.prodId.toString() === product._id.toString();
	});

	// If the product already in the cart we increase quantity
	// if not we add a new product to the cart
	if(productIndex >= 0){
		this.cart.products[productIndex].quantity += quantity;
		cartQuantity = this.cart.products[productIndex].quantity;
	}else {
		const newCartProduct = { prodId: product._id, quantity: quantity };
		this.cart.products.push(newCartProduct);
		cartQuantity = quantity;
	}

	// If the quantity in the cart bigger than the stock for that product we throw error without saving
	if(cartQuantity > product.stock){
		throw errorUtil.prepError(`The product does not have that much stock!`, 403);
	}

	try {
		// Calculates the price of the cart based on each product in the cart values for price and quantity and saves it
		await this.calculateTotalPrice();
		await this.save();
	}catch (err) {
		console.log(err);
		throw errorUtil.prepError(err.message, 500);
	}
};

// Calculates the price of the cart based on each product in the cart values for price and quantity
userSchema.methods.calculateTotalPrice = async function() {
	let totalPrice = 0;

	try {
		for (const p of this.cart.products) {
			const product = await Product.findById(p.prodId);
			if (product) {
				totalPrice += p.quantity * product.finalPrice;
			}
		}
	}catch(err) {
		throw errorUtil.prepError(err.message, 500);
	}

	this.cart.totalPrice = Number(totalPrice.toFixed(2));
};

userSchema.methods.clearCart = async function() {
	this.cart = { products: [], totalPrice: 0 };
	return this.save();
};

// When toJSON() method is called it should include the virtuals
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
