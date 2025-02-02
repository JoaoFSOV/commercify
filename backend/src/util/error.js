exports.prepError = (message, status) => {
	const error = new Error(message);
	error.statusCode = status;
	return error;
}
