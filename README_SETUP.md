# BureauPro - Setup Instructions

## Database Setup

### 1. Install MySQL
Make sure MySQL is installed and running on your system.

### 2. Create .env file
Create a `.env` file in the root directory with the following content:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mounjikouki12
DB_NAME=bureaupro_db
PORT=3001
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize Database
Run the database initialization script:
```bash
node server/initDb.js
```

This will:
- Create the database if it doesn't exist
- Create all necessary tables (users, products, categories)
- Insert default admin user (email: admin@bureaupro.com, password: admin123)
- Insert default categories and products

### 5. Start the Backend Server
```bash
npm run server
```

Or for development with auto-reload:
```bash
npm run dev:server
```

The server will run on http://localhost:3001

### 6. Start the Frontend
In a new terminal:
```bash
npm run dev
```

The frontend will run on http://localhost:5173 (or another port if 5173 is busy)

## Default Admin Account
- **Email**: admin@bureaupro.com
- **Password**: admin123

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/liked-products` - Update liked products

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories

## Environment Variables

You can customize the database connection by setting these environment variables in `.env`:

- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password (default: Mounjikouki12)
- `DB_NAME` - Database name (default: bureaupro_db)
- `PORT` - Backend server port (default: 3001)

For the frontend, you can set:
- `VITE_API_URL` - API base URL (default: http://localhost:3001/api)

