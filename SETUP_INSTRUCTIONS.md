# BureauPro - MySQL Database Setup

## Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Database
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mounjikouki12
DB_NAME=bureaupro_db
PORT=3001
```

### Step 3: Initialize Database
```bash
npm run init-db
```

This will:
- Create the database `bureaupro_db`
- Create tables: users, products, categories
- Create default admin user (admin@bureaupro.com / admin123)
- Insert default categories and products

### Step 4: Start Backend Server
```bash
npm run server
```
Server runs on http://localhost:3001

### Step 5: Start Frontend (in a new terminal)
```bash
npm run dev
```
Frontend runs on http://localhost:5173

## Default Admin Account
- **Email**: admin@bureaupro.com
- **Password**: admin123

## Database Schema

### Users Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- email (VARCHAR(255), UNIQUE)
- name (VARCHAR(255))
- password (VARCHAR(255), hashed)
- role (ENUM: 'user', 'admin')
- liked_products (TEXT, JSON array)
- created_at (TIMESTAMP)

### Products Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(255))
- description (TEXT)
- price (DECIMAL(10,2))
- category (VARCHAR(100))
- image_url (VARCHAR(500))
- images (TEXT, JSON array)
- features (TEXT, JSON array)
- stock (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Categories Table
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100), UNIQUE)
- created_at (TIMESTAMP)

## API Endpoints

Base URL: `http://localhost:3001/api`

### Users
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id/liked-products` - Update liked products

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

### Categories
- `GET /categories` - Get all categories

## Troubleshooting

### Database Connection Error
1. Make sure MySQL is running
2. Check your `.env` file has correct credentials
3. Verify MySQL user has proper permissions

### Port Already in Use
Change the PORT in `.env` file to a different port (e.g., 3002)

### CORS Errors
The backend has CORS enabled for all origins. In production, restrict this to your frontend domain.

