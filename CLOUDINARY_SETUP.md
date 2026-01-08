# ☁️ Cloudinary Configuration - Quick Reference

## ✅ Your Cloudinary Credentials

**IMPORTANT:** Add these to Render environment variables, NOT in code!

```
CLOUDINARY_CLOUD_NAME=dnyxp3imp
CLOUDINARY_API_KEY=451635898275612
CLOUDINARY_API_SECRET=2rqK4TKP5wGM_WeQlcQ7F0FmBk8
```

---

## 🚀 Quick Setup Steps

### Step 1: Add to Render (2 minutes)

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **Web Service** (e.g., `burocycle-backend`)
3. Go to **Environment** tab (left sidebar)
4. Scroll to **Environment Variables**
5. Add these 3 variables:

**Variable 1:**
- Key: `CLOUDINARY_CLOUD_NAME`
- Value: `dnyxp3imp`
- Click **Save**

**Variable 2:**
- Key: `CLOUDINARY_API_KEY`
- Value: `451635898275612`
- Click **Save**

**Variable 3:**
- Key: `CLOUDINARY_API_SECRET`
- Value: `2rqK4TKP5wGM_WeQlcQ7F0FmBk8`
- Click **Save**

### Step 2: Redeploy (2 minutes)

1. After adding all variables, go to **Events** tab
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait 2-5 minutes for deployment

### Step 3: Test (3 minutes)

1. Go to your Netlify app
2. Login as admin
3. Add a new product with an image
4. Check Cloudinary dashboard: https://cloudinary.com/console/media_library
5. Look in folder: `burocycle/products`

---

## ✅ Verification Checklist

- [ ] All 3 environment variables added to Render
- [ ] Render service redeployed successfully
- [ ] Backend health check: `https://your-backend.onrender.com/api/health`
- [ ] Image upload works in admin dashboard
- [ ] Images appear in Cloudinary Media Library

---

## 🔒 Security Note

**NEVER commit these credentials to GitHub!**
- ✅ Use environment variables (Render)
- ❌ Don't put them in code files
- ❌ Don't commit `.env` files

---

## 🎉 Done!

Your Cloudinary is now configured. All new image uploads will go to Cloudinary automatically!



