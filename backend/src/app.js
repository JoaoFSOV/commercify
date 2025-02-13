require('dotenv').config({ path: './src/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authMiddlewares = require('./middlewares/auth');
const errorMiddlewares = require('./middlewares/error');
const adminRoutes = require('./routes/admin');
const costumerRoutes = require('./routes/costumer');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.json()); // Allow us to parse the json body of each request
app.use(cookieParser()); // To allow us to read cookie values (token)

// Middleware to validate token sent in cookies, aply basic authorization and set userId
app.use(authMiddlewares.authenticate);

// All route handling middlewares
app.use('/admin', adminRoutes);
app.use(costumerRoutes);
app.use(authRoutes);

// Middleware to handle every error
app.use(errorMiddlewares.defaultErrorHandler);

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		app.listen(process.env.APP_PORT);
	})
	.catch(err => console.log(err));
