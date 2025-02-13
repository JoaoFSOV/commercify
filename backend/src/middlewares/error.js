// Gets and error and sends it as a response
exports.defaultErrorHandler = (error, req, res, next) => {
	console.log(error);
	res.status(error.statusCode || 500).json({ message: error.message });
};
