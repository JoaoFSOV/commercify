const { Product, Rating } = require('../models/product');
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

// Rating a product, creates a rating document in the database if or updates it and updates Product avgRating
exports.rateProduct = async (req, res, next) => {
	const prodId = req.params.prodId;
	const rating = req.body.rating;
	const userId = req.userId;

	try {
		const product = await Product.findOne({ _id: prodId });
		if(!product) return next(errorUtil.prepError(`No product found with id = ${prodId}`, 404));
		
		const existingRating = await Rating.findOne({ userId: userId, prodId: prodId });
		if (existingRating) {
            existingRating.rating = rating;  
            await existingRating.save();
        } else {
            const newRating = new Rating({ userId: userId, rating: rating, prodId: prodId });
            await newRating.save();
			product.nRatings++;
        }

		// Recalculate the average rating
        const ratings = await Rating.find({ prodId: prodId });
        const avgRating = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);
		product.averageRating = avgRating;
		await product.save();

        res.status(200).json({ message: 'Rating submitted!', averageRating: avgRating });
	} catch(err) {
		next(errorUtil.prepError(err.message, 500));
	}
};
