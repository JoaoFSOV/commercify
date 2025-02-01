require('dotenv').config({ path: './src/.env' });

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const costumerRoutes = require('./routes/costumer');

const app = express();

app.use(bodyParser.json());

app.use('/', (req, res, next) => {
	console.log("First middleware in line");
	next();
});

app.use('/', costumerRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => {
	res.status(error.statusCode || 500).json({ message: error.message });
});

mongoose
	.connect(process.env.MONGODB_URI)
	.then(result => {
		app.listen(process.env.APP_PORT);
	})
	.catch(err => console.log(err));
