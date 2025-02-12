# Commercify 🛒

Commercify is a simple e-commerce web application built with **Angular** for the frontend and **Node.js with Express.js** for the backend, using **MongoDB** as the database.  
The project includes authentication, role-based access control, and basic shopping functionalities such as product listings, cart management, and checkout.

---

## ✨ Features

### 🔹 Backend (Node.js + Express.js)
- REST API with **JWT authentication** (HTTP-only cookies)
- Role-based access control (**Customer/Admin**)
- Secure **user authentication** (register, login, logout)
- **CSRF protection** and security best practices (Helmet, cookie settings)
- **Product management** (CRUD operations)
- **Shopping cart system**
- **Order creation & checkout** (Stripe for payments)
- **Blacklist mechanism for JWT logout**
- **MVC architecture** for better code organization

### 🔹 Frontend (Angular) (The frontend aspect of it was not the focus)
- **User authentication** (login, register, logout)
- **Product listing & categories**
- **Shopping cart** with add/remove functionality
- **Checkout page** with order processing
- **Role-based access control** (customers/admins)
- **Responsive design** with **Angular Material**
- **State management** using Angular services or NgRx (TBD)

---

## 🛠️ Tech Stack

### Backend:
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **CSRF Protection**
- **Stripe API** (for payments)
- **Helmet.js** (security middleware)

### Frontend
- **Angular**
- **Angular Material** (UI components)
- **RxJS**
- **NgRx or Angular Services** (state management)
- **Tailwind CSS** (optional for styling)

---

## 🚀 Installation & Setup

```
git clone https://github.com/your-username/commercify.git
cd commercify
```

## Extra
More specific info and instructions will be present in the README.md file of each project folder.
