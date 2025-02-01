const mongoose = require('mongoose');

const blackListedTokenSchema = new mongoose.Schema({
	jId: { type: String, required: true, unique: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	blackListedAt: { type: Date, default: Date.now },
	expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('BlackListedToken', blackListedTokenSchema);
