# BureauPro - Local Setup Script for PowerShell
# This script sets up and runs the project locally

Write-Host "BureauPro Local Setup" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env exists, create if not
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
# Local Development Environment Variables

# Server
NODE_ENV=development
PORT=3001

# MySQL Database (Local Development)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mounjikouki12
DB_NAME=bureaupro_db

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dnyxp3imp
CLOUDINARY_API_KEY=451635898275612
CLOUDINARY_API_SECRET=2rqK4TKP5wGM_WeQlcQ7F0FmBk8

# Frontend API URL (optional - defaults to http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api

# JWT Secret
JWT_SECRET=maSuperCleSecrete123456789
"@
    [System.IO.File]::WriteAllText("$PWD\.env", $envContent)
    Write-Host ".env file created" -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed" -ForegroundColor Green

# Step 3: Initialize database
Write-Host ""
Write-Host "Initializing database..." -ForegroundColor Yellow
npm run init-db

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Database initialization failed. Make sure MySQL is running!" -ForegroundColor Yellow
    Write-Host "You can still start the server, but database operations may fail." -ForegroundColor Yellow
} else {
    Write-Host "Database initialized" -ForegroundColor Green
}

# Step 4: Instructions
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the project:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the backend server (Terminal 1):" -ForegroundColor White
Write-Host "   npm run server" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start the frontend (Terminal 2):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the app:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default admin login:" -ForegroundColor Yellow
Write-Host "   Email:    admin@bureaupro.com" -ForegroundColor Cyan
Write-Host "   Password: admin123" -ForegroundColor Cyan
Write-Host ""
