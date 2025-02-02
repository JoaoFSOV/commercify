const Product = require('../models/product');
const errorUtil = require('../util/error');

// Retreives all products from the database
// TODO: Implement pagination 
exports.getProducts = async (req, res, next) => {
	let products = [];
	try {
		const amount = await Product.find().countDocuments();

		if(amount > 0) products = await Product.find();
		else next(errorUtil.prepError('No products found.', 404));

		res.status(200).json({ amount: amount, products: products });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};

// Retreives a product from the database with the id received in the request params
exports.getProduct = async (req, res, next) => {
	const prodId = req.params.prodId;

	try {
		const product = await Product.findOne({_id: prodId});
		if(product == null) return next(errorUtil.prepError(`No product found with id = ${prodId}`, 404));

		res.status(200).json({ product: product });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};
