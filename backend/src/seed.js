require('dotenv').config({ path: './src/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); 
const { Rating, Product } = require('./models/product');

async function seedDatabase() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);

		console.log('Connected to MongoDB');

		// Clear existing data (optional)
		await User.deleteMany({});
		await Product.deleteMany({});
		await Rating.deleteMany({});
		console.log('Database cleared');

		// Hash passwords
		const hashedAdminPassword = await bcrypt.hash('admin123', 10);
		const hashedCustomerPassword = await bcrypt.hash('customer123', 10);

		// Seed Users
		const users = await User.insertMany([
			{
				email: 'admin@example.com',
				name: 'Admin User',
				password: hashedAdminPassword,
				role: 'admin',
				cart: { products: [], totalPrice: 0 }
			},
			{
				email: 'customer@example.com',
				name: 'Customer User',
				password: hashedCustomerPassword,
				role: 'customer',
				cart: { products: [], totalPrice: 0 }
			}
		]);
		console.log('Users seeded');

		// Seed Products
		const products = await Product.insertMany([
			{
				name: 'Laptop XYZ',
				price: 1200,
				discount: 10,
				description: 'High-performance laptop',
				type: 'tech',
				brand: 'TechBrand',
				stock: 50,
				averageRating: 5,
				nRatings: 2,
				slug: 'laptop-xyz',
				imageUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFwdG9wJTIwY29tcHV0ZXJ8ZW58MHx8MHx8fDA%3D'
			},
			{
				name: 'Running Shoes',
				price: 100,
				discount: 5,
				description: 'Comfortable running shoes',
				type: 'sports',
				brand: 'SportBrand',
				stock: 100,
				averageRating: 4,
				nRatings: 2,
				slug: 'running-shoes',
				imageUrl: 'https://assets.ajio.com/medias/sys_master/root/20240516/dxrK/6645c59505ac7d77bb611ce6/-473Wx593H-466410362-grey-MODEL.jpg'
			}
		]);
		console.log('Products seeded');

		// Seed Ratings
		await Rating.insertMany([
			{ userId: users[0]._id, prodId: products[0]._id, rating: 5 },
			{ userId: users[0]._id, prodId: products[1]._id, rating: 4 },
			{ userId: users[1]._id, prodId: products[0]._id, rating: 5 },
			{ userId: users[1]._id, prodId: products[1]._id, rating: 4 }
		]);
		console.log('Ratings seeded');

		console.log('Database seeded successfully');
		mongoose.connection.close();
	} catch (error) {
		console.error('Error seeding database:', error);
		mongoose.connection.close();
	}
}

// Run the seed function
seedDatabase();

