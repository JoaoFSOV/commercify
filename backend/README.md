# Commercify Backend API

The backend for Commercify is built with Node.js and Express.js, using MongoDB as the database. It serves a REST API with authentication and authorization features:

- **Authentication**: Protected routes require a valid JWT token set in the cookie after login.
- **Authorization**: Users have roles (customer or admin) that control access to different routes.

## Security Handling

- **Token Blacklisting**: When a user logs out, their JWT token is blacklisted and stored in the database. Any request with a blacklisted token will be rejected.

## Core E-commerce Features

- CRUD operations for products and users
- Add products to the user's cart
- Create orders and handle payments via Stripe (in development environment)

## API Endpoints

🔑 Authentication
| Method | Endpoint            | Description                         | Auth Required |
|--------|---------------------|-------------------------------------|--------------|
| POST   | `/signup`           | Register a new user                 | ❌ No        |
| POST   | `/login`            | Log in, sending a new JWT token     | ❌ No        |
| GET    | `/me`               | Get current logged-in user data     | ✅ Yes       |
| POST   | `/logout`           | Log out (blacklist token)           | ✅ Yes       |
| POST   | `/forgot`           | Send email with reset token         | ❌ No        |
| POST   | `/reset`            | Reset user password                 | ❌ No        |
| PUT    | `/promote/:userId`  | Promote a user to admin (admin)     | ✅ Yes       |

🛒 Products
| Method | Endpoint                   | Description                         | Auth Required |
|--------|----------------------------|-------------------------------------|--------------|
| POST   | `/create-product`          | Create a new product (admin)        | ✅ Yes       |
| PUT    | `/edit-product/:prodId`    | Update a product (admin)            | ✅ Yes       |
| DELETE | `/delete-product/:prodId`  | Delete a product (admin)            | ✅ Yes       |
| GET    | `/products`                | Get all products                    | ❌ No        |
| GET    | `/product/:slug`           | Get a specific product              | ❌ No        |
| POST   | `/rate-product/:prodId`    | Rate an existing product            | ✅ Yes       |

🛍️ Shopping Cart
| Method  | Endpoint            | Description                     | Auth Required |
|---------|---------------------|---------------------------------|--------------|
| GET     | `/cart`             | Get current user's cart         | ✅ Yes       |
| POST    | `/add-to-cart`      | Add product to user's cart      | ✅ Yes       |
| DELETE  | `/remove-from-cart` | Remove product from user's cart | ✅ Yes       |

💳 Orders
| Method | Endpoint     | Description                  | Auth Required |
|--------|-------------|------------------------------|--------------|
| POST   | `/checkout` | Create an order (checkout)   | ✅ Yes       |
| GET    | `/orders`   | Get all user orders          | ✅ Yes       |


## 🛡️ Security Measures

- JWT-based authentication stored in HTTP-only cookies
- Role-based access control (RBAC)
- CSRF protection
- Helmet.js for security headers
- Token blacklist mechanism to prevent reuse of logged-out JWTs

## Installation

From inside the `backend` folder, run:

```npm install```

## Set up Environment Variables

Configure the following environment variables either in a `.env` file or by adding them to the start script in `package.json`:

### Using a `.env` file in the root folder:

- APP_PORT=your_port
- MONGO_URI=your_mongo_uri
- JWT_SECRET=your_secret
- NODE_ENV=your_env  # production or development
- EMAIL_SENDER=your_email
- FRONTEND_URL=your_frontend_url

### Or adding them to the start script in `package.json`:

```
"scripts": {
    "start": "APP_PORT=your_port MONGO_URI=your_mongo_uri JWT_SECRET=your_secret NODE_ENV=your_env EMAIL_SENDER=your_email FRONTEND_URL=your_frontend_url node app.js"
}
```

## Scripts to run the app
```npm start```         # Starts the app (same as `node app.js`)
```npm run start:dev``` # Uses nodemon for development

