# 🖥️ Run Project Locally - Complete Guide

## Current Issue
MySQL is not installed on your system. You have 2 options:

---

## ✅ OPTION 1: Install MySQL (Recommended for full local development)

### Step 1: Install MySQL
1. Download MySQL: https://dev.mysql.com/downloads/installer/
2. Choose "MySQL Installer for Windows"
3. Run the installer
4. Select "Developer Default" setup
5. Set root password (remember it!)
6. Complete installation

### Step 2: Update .env file
Open `.env` and update the password:
```env
DB_PASSWORD=your_mysql_password_here
```

### Step 3: Initialize database
```bash
npm run init-db
```

### Step 4: Run the project
```bash
npm run server
```

---

## ✅ OPTION 2: Use Render Database (Easier - No MySQL install needed)

### Step 1: Get Render database URL
1. Go to Render Dashboard: https://dashboard.render.com
2. Open your PostgreSQL database
3. Copy the "Internal Database URL"
   - Format: `postgresql://user:password@host:5432/database`

### Step 2: Update .env file
Open `.env` and add the DATABASE_URL:
```env
# Comment out MySQL settings
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=bureaupro_db

# Add PostgreSQL URL from Render
DATABASE_URL=postgresql://your_database_url_here
```

### Step 3: Run the project
```bash
npm run server
```

The server will automatically connect to your Render PostgreSQL database!

---

## 🚀 After Server Starts Successfully

### Start the Frontend
Open a NEW terminal and run:
```bash
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

### Login
- Email: `admin@bureaupro.com`
- Password: `admin123`

---

## 📝 Current .env Configuration

Your `.env` file already has Cloudinary configured:
```env
CLOUDINARY_CLOUD_NAME=dnyxp3imp
CLOUDINARY_API_KEY=451635898275612
CLOUDINARY_API_SECRET=2rqK4TKP5wGM_WeQlcQ7F0FmBk8
```

✅ Cloudinary will work once the database is connected!

---

## 🎯 Quick Decision Guide

**Choose Option 1 if:**
- You want full local development
- You're comfortable installing MySQL
- You want faster local testing

**Choose Option 2 if:**
- You want to start quickly
- You don't want to install MySQL
- You're okay with using the cloud database

---

## 🐛 Troubleshooting

### Server won't start
- Check if another process is using port 3001
- Make sure .env file exists in the root directory

### Database connection fails
- **Option 1:** Verify MySQL is running and password is correct
- **Option 2:** Verify DATABASE_URL is correct and complete

### Frontend can't connect to backend
- Make sure backend is running on port 3001
- Check `VITE_API_URL` in frontend (should be http://localhost:3001/api)

---

## 💡 Recommendation

**Use Option 2** (Render database) - it's faster and you're already set up on Render!



