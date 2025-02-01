require('dotenv').config({ path: './src/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authMiddlewares = require('./middlewares/auth');
const adminRoutes = require('./routes/admin');
const costumerRoutes = require('./routes/costumer');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', authMiddlewares.authenticate);

app.use('/admin', adminRoutes);
app.use(costumerRoutes);
app.use(authRoutes)

app.use((error, req, res, next) => {
	res.status(error.statusCode || 500).json({ message: error.message });
});

mongoose
	.connect(process.env.MONGODB_URI)
	.then(result => {
		app.listen(process.env.APP_PORT);
	})
	.catch(err => console.log(err));
