const slugify = require('slugify');
const crypto = require('crypto');

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	rating: { type: Number, required: true, min: 1, max: 5 },
	prodId: { type: mongoose.Schema.Types.ObjectId, ref:'Product', required: true }
});

const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, required: true, min: 0 },
	discount: { type: Number, default: 0, min: 0, max: 100 },
	description: { type: String, required: true },
	type: { type: String, enum: ['tech', 'household', 'clothing', 'beauty', 'sports'], required: true},
	brand: { type: String, required: true },
	stock: { type: Number, min: 0, default: 0 },
	averageRating: { type: Number, default: 0, min: 0, max: 5 },
	nRatings: { type: Number, default: 0, min: 0 },
	slug: { type: String },
	imageUrl: { type: String, required: true } 
	//images: { type: [String], default: [], validate: {
		//validator: function(arr) {
			//return arr.length <= 7;
		//},
		//message: 'You can only have 7 images per product.'
	//}}
}, { timestamps: true });

productSchema.virtual('finalPrice').get(function () {
	return parseFloat(this.price * (1 - this.discount / 100)).toFixed(2);
});

// When toJSON() method is called it should include the virtuals
productSchema.set('toJSON', { virtuals: true });

// Middleware to auto generate slug before saving
productSchema.pre('save', async function(next) {
	try {
		if (!this.slug || this.isModified('name')) {
			let newSlug = slugify(this.name, { lower: true, strict: true });
			let existingProduct = await mongoose.models.Product.findOne({ slug: newSlug });

			if (existingProduct) {
				const uniqueId = crypto.randomBytes(3).toString('hex');
				newSlug = `${newSlug}-${uniqueId}`;
			}
			this.slug = newSlug;
		}
		next();
	} catch (err) {
		console.error('Error generating slug:', err);
		next(err); // Pass the error to the next middleware or handler
	}
});

exports.Product = mongoose.model('Product', productSchema);
exports.Rating = mongoose.model('Rating', ratingSchema);
