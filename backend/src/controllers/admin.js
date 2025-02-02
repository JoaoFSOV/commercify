const { Product } = require('../models/product');
const User = require('../models/user');
const errorUtil = require('../util/error');

const ROLES_ENUM = ['customer', 'admin'];

// Creates a product in the database with the data on the request body
exports.createProduct = async (req, res, next) => {
	const { name, price, description, type, brand, stock, discount } = req.body;
	const product = new Product({
		name: name,
		price: price,
		description: description,
		type: type,
		brand: brand,
		stock: stock,
		discount: discount
	});

	try {
		const result = await product.save();
		res.status(201).json({ message: 'Product saved!', product: result });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Updates a product in the database with the data in the request body
exports.editProduct = async (req, res, next) => {
	const prodId = req.params.prodId;

	try {
		const product = await Product.findById(prodId);
		if(!product) {
			return next(errorUtil.prepError(`No product found with id = ${prodId}.`, 404));
		}

		product.name = req.body.name ?? product.name;
		product.price = req.body.price ?? product.price;
		product.description = req.body.description ?? product.description;
		product.type = req.body.type ?? product.type;
		product.brand = req.body.brand ?? product.brand;
		product.stock = req.body.stock ?? product.stock;
		product.discount = req.body.discount ?? product.discount;

		const result = await product.save();
		res.status(200).json({ message: 'Product updated!', product: result });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Deletes from the database the product with the id received in the request params
exports.deleteProduct = async (req, res, next) => {
	const prodId = req.params.prodId;

	try {
		const result = await Product.findOneAndDelete({_id: prodId});
		if(result == null) return next(errorUtil.prepError(`No product found with id = ${prodId}.`, 404));

		res.status(200).json({ message: 'Product deleted' });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Promotes a user
exports.promote = async (req, res, next) => {
	const userId = req.params.userId;

	try {
		const user = await User.findOne({ _id: userId });
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404))

		const roleIndex = ROLES_ENUM.findIndex(r => r === user.role);
		if(roleIndex < ROLES_ENUM.length - 1){
			user.role = ROLES_ENUM[roleIndex + 1];
			await user.save();
			return res.status(200).json({ message: `User is now ${user.role}.`});
		}

		return next(errorUtil.prepError("Can't promote that user anymore.", 400));
	}catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

