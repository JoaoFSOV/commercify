const Product = require('../models/product');

exports.createProduct = async (req, res, next) => {
	const product = new Product({
		name: req.body.name,
		price:  req.body.price,
		description: req.body.description,
		type: req.body.type,
		brand: req.body.brand,
		stock: req.body.stock,
		discount: req.body.discount
	});

	try {
		const result = await product.save();
		res.status(201).json({ message: 'Product saved!', product: result });
	} catch(err) {
		const error = new Error(err);
		error.statusCode = 500;
		return next(error);
	}
};

exports.editProduct = async (req, res, next) => {
	const prodId = req.params.prodId;
	const product = await Product.findById(prodId);
	if(!product) {
		const error = new Error(`No product found with id = ${prodId}`);
		error.statusCode = 404;
		return next(error);
	}
	
	product.name = req.body.name || product.name;
	product.price = req.body.price || product.price;
	product.description = req.body.description || product.description;
	product.type = req.body.type || product.type;
	product.brand = req.body.brand || product.brand;
	product.stock = req.body.stock || product.stock;
	product.discount = req.body.discount || product.discount;

	try {
		const result = await product.save();
		res.status(200).json({ message: 'Product updated!', product: result });

	}catch(err) {
		const error = new Error(err);
		error.statusCode = 500;
		return next(error);
	}

};

exports.deleteProduct = async (req, res, next) => {
	const prodId = req.params.prodId;
	try {
		const result = await Product.findOneAndDelete(prodId);
		if(result == null) return res.status(404).json({ error: `No product found with id = ${prodId}`});

		res.status(200).json({ message: 'Product deleted' });
	} catch(err) {
		const error = new Error(err);
		error.statusCode = 500;
		return next(error);
	}
};
