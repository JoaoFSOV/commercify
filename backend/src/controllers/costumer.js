const { validationResult } = require('express-validator');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_KEY);

const { Product, Rating } = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const errorUtil = require('../util/error');

exports.getProducts = async (req, res, next) => {
	const limit = +req.query.limit || 5;
	const page = +req.query.page || 1;

	let products = [];
	try {
		let amount = await Product.find().countDocuments();
		if(amount === 0) return next(errorUtil.prepError('No products found.', 404));
		if(amount > limit) amount = limit;

		// Applies a limit and a skip value for paggination purposes
		products = await Product.find().skip((page - 1) * limit).limit(limit);
		res.status(200).json({ amount: amount, products: products });
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Retreives a product from the database with the slug received in the request params
exports.getProduct = async (req, res, next) => {
	const slug = req.params.slug;

	try {
		const product = await Product.findOne({slug: slug});
		if(product == null) return next(errorUtil.prepError(`No product found with slug = ${slug}`, 404));

		res.status(200).json({ product: product });
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.rateProduct = async (req, res, next) => {
	const prodId = req.params.prodId;
	const rating = req.body.rating;
	const userId = req.userId;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	try {
		const product = await Product.findOne({ _id: prodId });
		if(!product) return next(errorUtil.prepError(`No product found with id = ${prodId}`, 404));
		
		// If that user has already rated that product it updates it,
		// if not it creates a rating document and saves it increasing the nRatings of the product
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
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Retreives the user cart
exports.getCart = async (req, res, next) => {
	const userId = req.userId;

	try {
		const user = await User.findById(userId).populate('cart.products.prodId');
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404));

		const cleanedCart = user.cart.products.map(p => {
			return { product: p.prodId, quantity: p.quantity };
		});
		
		const cart = { 
			products: cleanedCart,
			totalPrice: user.cart.totalPrice
		}

		res.status(200).json({ cart: cart });
	} catch (err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Adds X quantitiy of an item to the user cart
exports.addToCart = async (req, res, next) => {
	const prodId = req.params.prodId;
	const quantity = req.body.quantity;
	const userId = req.userId;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	try {
		const user = await User.findById(userId);
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404));

		const product = await Product.findById(prodId);
		if(!product) return next(errorUtil.prepError(`No product found with id = ${prodId}.`, 404));

		await user.addToCart(product, quantity);
		res.status(201).json({ message: 'Product added to cart!' });

	}catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Removes X quantity of a product from the user cart
exports.removeFromCart = async (req, res, next) => {
	const prodId = req.params.prodId;
	const quantity = req.body.quantity;
	const userId = req.userId;

	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed. Check your input.', errors: errors.array() });

	try {
		const user = await User.findById(userId);
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404));

		const productIndex = user.cart.products.findIndex(p => p.prodId.toString() === prodId);
		if (productIndex === -1) return next(errorUtil.prepError('You do not have that item in your cart.'), 404);

		// If the cart contains less or equal the amount to be removed, it should remove the items from the array of products in the cart
		// if not it should just decrease the quantity, either way we save the quantity removed
		const cartProduct = user.cart.products[productIndex];
		let cartProductQty = 0;
        if (cartProduct.quantity <= quantity) {
			cartProductQty = cartProduct.quantity;
            user.cart.products.splice(productIndex, 1);
        } else {
            cartProduct.quantity -= quantity;
			cartProductQty = quantity;
        }
		
		// We use the quantity removed value and update the totalPrice value of the user cart
		const product = await Product.findById(prodId);
		const newTotalPrice = parseFloat(user.cart.totalPrice - parseFloat(cartProductQty * product.finalPrice).toFixed(2)).toFixed(2);
		user.cart.totalPrice = newTotalPrice;
        await user.save();
		res.status(200).json({ message: "Items removed from the cart." });
	}catch (err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

// Retreives all current logged in user's orders
exports.getUserOrders = async (req, res, next) => {
	const userId = req.userId;
	
	try {
		const userOrders = await Order.find({ 'user.userId': userId });
		res.status(200).json({ orders: userOrders });
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.checkout = async (req, res, next) => {
	const userId = req.userId;

	try {
		const user = await User.findById(userId).populate('cart.products.prodId');
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404));

		if(user.cart.products.length === 0) return next(errorUtil.prepError(`Can't checkout with empty cart.`, 404));

		// Creating the stripe checkout session's line_items attribute
		const line_items = user.cart.products.map(p => ({
			price_data: {
				currency: 'EUR',
				product_data: {
					name: p.prodId.name,
					images: [p.prodId.imageUrl]
				},
				unit_amount: Math.round(p.prodId.finalPrice * 100)
			},
			quantity: p.quantity
		}));

		// Creating the actuall checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: line_items,
			mode: 'payment',
			success_url: `http://localhost:${process.env.APP_PORT}/checkout/success`,
			cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
		});

		// Redirecting to the created sessioon url wich would be the stripe page
		res.redirect(session.url);
	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

exports.getCheckoutSuccess = async (req, res, next) => {
	const userId = req.userId;	

	try {
		const user = await User.findById(userId).populate('cart.products.prodId');
		if(!user) return next(errorUtil.prepError(`No user found with id = ${userId}.`, 404));

		// Create an array of product elements that can be used in the order model
		const orderProducts = user.cart.products.map(p => {
			return {
				product: {...p.prodId._doc },
				quantity: p.quantity
			}
		});

		// Created the new order instance
		const newOrder = new Order({
			user: {
				email: user.email,
				userId: userId
			},
			products: orderProducts
		});

		// Saving the new order in the database, clearing the user cart and redirecting to frontend page
		await newOrder.save();
		await user.clearCart();
		res.redirect(`${process.env.FRONTEND_URL}/checkout/success`);

	} catch(err) {
		next(errorUtil.prepError(err.message, err.statusCode));
	}
};

