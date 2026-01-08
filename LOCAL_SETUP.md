# 🖥️ Local Development Setup

## Step 1: Create .env file

Create a file named `.env` in the root directory (same level as `package.json`):

```env
# Local Development Environment Variables

# Server
NODE_ENV=development
PORT=3001

# MySQL Database (Local Development)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bureaupro_db

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dnyxp3imp
CLOUDINARY_API_KEY=451635898275612
CLOUDINARY_API_SECRET=2rqK4TKP5wGM_WeQlcQ7F0FmBk8

# JWT Secret
JWT_SECRET=maSuperCleSecrete123456789!@#$%^&*()_+-=[]{}|;:,.<>?
```

**Important:** If your MySQL has a password, add it to `DB_PASSWORD=your_password`

## Step 2: Initialize MySQL database

Run this command to create the database and tables:

```bash
npm run init-db
```

## Step 3: Start the server

```bash
npm run server
```

You should see:
```
🚀 Server running on http://localhost:3001
📡 API endpoints available at http://localhost:3001/api
✅ Connected to MySQL database
```

## Step 4: Start the frontend

Open a new terminal and run:

```bash
npm run dev
```

## Troubleshooting

### MySQL connection error
If you see "Access denied for user 'root'@'localhost'":
1. Make sure MySQL is installed and running
2. Update `DB_PASSWORD` in `.env` with your MySQL password
3. Or install MySQL: https://dev.mysql.com/downloads/mysql/

### Database doesn't exist
Run: `npm run init-db`

### Cloudinary upload fails locally
Make sure the `.env` file has your Cloudinary credentials.

## For Production (Render)

Add the same environment variables in Render's Environment tab (not in code).



