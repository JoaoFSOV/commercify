const mongoose = require('mongoose');

//Might want to add ratings later on
const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, required: true, min: 0 },
	description: { type: String, required: true },
	type: { type: String, enum: ['tech', 'household', 'clothing', 'beauty', 'sports'], required: true},
	//images: { type: [String], default: [] },
	brand: { type: String, required: true },
	stock: { type: Number, min: 0, default: 0 },
	discount: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
