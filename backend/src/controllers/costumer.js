const Product = require('../models/product');

// Retreives all products from the database
// TODO: Implement pagination 
exports.getProducts = async (req, res, next) => {
	let products = [];
	const amount = await Product.find().countDocuments();

	if(amount > 0) products = await Product.find();
	else 
		return res.status(404).json({ error: 'No products found' });

	res.status(200).json({ amount: amount, products: products });
};

// Retreives a product from the database with the id received in the request params
exports.getProduct = async (req, res, next) => {
	const prodId = req.params.prodId;

	const product = await Product.findOne({_id: prodId});
	if(product == null) 
		return res.status(404).json({ error: `No product found with id = ${prodId}` });

	res.status(200).json({ product: product });
};
