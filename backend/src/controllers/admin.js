const { validationResult } = require('express-validator');

const { Product } = require('../models/product');
const User = require('../models/user');
const errorUtil = require('../util/error');

const ROLES_ENUM = ['customer', 'admin'];

// Creates a product in the database with the data on the request body
exports.createProduct = async (req, res, next) => {
	const { name, price, description, type, brand, stock, discount, imageUrl } = req.body;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	const product = new Product({
		name: name,
		price: price,
		description: description,
		type: type,
		brand: brand,
		stock: stock,
		discount: discount,
		imageUrl: imageUrl,
	});

	try {
		const result = await product.save();
		res.status(201).json({ message: 'Product saved!', product: result });
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Updates a product in the database with the data in the request body
exports.editProduct = async (req, res, next) => {
	const prodId = req.params.prodId;
	const { name, price, description, type, brand, stock, discount, imageUrl } = req.body;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	try {
		const product = await Product.findById(prodId);
		if(!product) {
			return next(errorUtil.prepError(`No product found with id = ${prodId}.`, 404));
		}

		product.name = name ?? product.name;
		product.price = price ?? product.price;
		product.description = description ?? product.description;
		product.type = type ?? product.type;
		product.brand = brand ?? product.brand;
		product.stock = stock ?? product.stock;
		product.discount = discount ?? product.discount;
		product.imageUrl = imageUrl ?? product.imageUrl;

		const result = await product.save();
		res.status(200).json({ message: 'Product updated!', product: result });
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
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
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Promotes a user
exports.promote = async (req, res, next) => {
	const userId = req.params.userId;

	try {
		const user = await User.findOne({ _id: userId });
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404))

		const roleIndex = ROLES_ENUM.findIndex(r => r === user.role);
		// if not the greatest role in the array, promote it
		if(roleIndex < ROLES_ENUM.length - 1){
			user.role = ROLES_ENUM[roleIndex + 1];
			await user.save();
			return res.status(200).json({ message: `User is now ${user.role}.`});
		}

		return next(errorUtil.prepError("Can't promote that user anymore.", 403));
	}catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

