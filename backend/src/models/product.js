const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	rating: { type: Number, required: true, min: 1, max: 5 },
	prodId: { type: mongoose.Schema.Types.ObjectId, ref:'Product', required: true }
});

const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, required: true, min: 0 },
	description: { type: String, required: true },
	type: { type: String, enum: ['tech', 'household', 'clothing', 'beauty', 'sports'], required: true},
	brand: { type: String, required: true },
	stock: { type: Number, min: 0, default: 0 },
	discount: { type: Number, default: 0, min: 0, max: 100 },
	averageRating: { type: Number, default: 0, min: 0, max: 5 },
	nRatings: { type: Number, default: 0, min: 0 },
	images: { type: [String], default: [], validate: {
		validator: function(arr) {
			return arr.length <= 7;
		},
		message: 'You can only have 7 images per product.'
	}}
}, { timestamps: true });

exports.Product = mongoose.model('Product', productSchema);
exports.Rating = mongoose.model('Rating', ratingSchema);
