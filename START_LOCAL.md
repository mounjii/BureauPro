# 🚀 Start Project Locally - PowerShell Commands

## Step 1: Get Render Database URL

1. Open browser: https://dashboard.render.com
2. Click on your PostgreSQL database
3. Find "Internal Database URL" 
4. Copy the entire URL (starts with `postgresql://`)

## Step 2: Update .env File

Run this in PowerShell (replace `YOUR_DATABASE_URL` with the URL from Step 1):

```powershell
cd C:\Users\a\Desktop\BUREAUPRO

@"
# Local Development Environment Variables
NODE_ENV=development
PORT=3001

# PostgreSQL Database (from Render)
DATABASE_URL=YOUR_DATABASE_URL_HERE

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dnyxp3imp
CLOUDINARY_API_KEY=451635898275612
CLOUDINARY_API_SECRET=2rqK4TKP5wGM_WeQlcQ7F0FmBk8

# JWT Secret
JWT_SECRET=maSuperCleSecrete123456789!@#$%^&*()_+-=[]{}|;:,.<>?
"@ | Out-File -FilePath .env -Encoding utf8 -Force
```

## Step 3: Start Backend Server

```powershell
npm run server
```

You should see:
```
🚀 Server running on http://localhost:3001
📡 API endpoints available at http://localhost:3001/api
✅ Connected to PostgreSQL database
```

## Step 4: Start Frontend (Open NEW PowerShell window)

```powershell
cd C:\Users\a\Desktop\BUREAUPRO
npm run dev
```

## Step 5: Open Browser

- Frontend: http://localhost:5173
- Login: admin@bureaupro.com / admin123

---

## 📋 Quick Copy-Paste Commands

**Terminal 1 (Backend):**
```powershell
cd C:\Users\a\Desktop\BUREAUPRO
npm run server
```

**Terminal 2 (Frontend):**
```powershell
cd C:\Users\a\Desktop\BUREAUPRO
npm run dev
```

---

## ❓ Need Help?

**Tell me your Render database URL and I'll update the .env file automatically!**



