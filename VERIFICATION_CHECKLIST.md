# Verification Checklist - After Deployment

## ✅ What We Fixed

1. **CORS Security** - Now rejects HTTP origins in production
2. **API URL Configuration** - Uses `/api` (relative) instead of `localhost:3001` in production
3. **Static File Serving** - Fixed MIME types and HTML asset paths
4. **Build Configuration** - Cleans dist folder before building

## 🔍 Step-by-Step Verification

### Step 1: Monitor Railway Deployment (5-10 minutes)

1. Go to your Railway dashboard
2. Click on your project
3. Watch the **Deployments** tab
4. Wait for build to complete (should see "✅ Deployed successfully")

### Step 2: Check Railway Logs

After deployment, check the logs for:

**✅ Good Signs:**
```
✅ Found dist directory at: /app/dist
📦 Assets directory contents: [index-XXX.js, index-XXX.css]
🔧 API Configuration:
   API_BASE_URL: /api
   isProduction: true
✅ Fixed HTML asset paths: JS=index-XXX.js, CSS=index-XXX.css
```

**❌ Problems to Watch For:**
- `API_BASE_URL: http://localhost:3001/api` (should be `/api`)
- `ERR_CONNECTION_REFUSED` errors
- 404 errors for JS/CSS files

### Step 3: Test in Browser

1. **Open your Railway app URL** (e.g., `https://bureaupro-production-XXX.up.railway.app`)

2. **Open Browser DevTools** (F12)

3. **Check Console Tab:**
   - Should see: `🔧 API Configuration:` with `API_BASE_URL: /api`
   - Should NOT see: `ERR_CONNECTION_REFUSED`
   - Should NOT see: `localhost:3001` in any errors

4. **Check Network Tab:**
   - Filter by "XHR" or "Fetch"
   - Try to login
   - API calls should go to `/api/users/login` (not `localhost:3001`)
   - Status should be 200 (not failed)

5. **Test Login:**
   - Try logging in with your credentials
   - Should connect successfully
   - No network errors

### Step 4: Verify Static Files

1. **Check Network Tab** for static files:
   - JS files: Should load with status 200
   - CSS files: Should load with status 200
   - Content-Type headers should be correct:
     - JS: `application/javascript`
     - CSS: `text/css`

2. **No 404 errors** for:
   - `/assets/index-XXX.js`
   - `/assets/index-XXX.css`

### Step 5: Test Image Upload (if applicable)

1. Try uploading an image
2. Should work without 500 errors
3. Should return image URL

## 🐛 Troubleshooting

### If API still uses localhost:3001

**Check:**
1. Railway logs for `🔧 API Configuration:` output
2. Browser console for the same log
3. Verify `VITE_API_URL` is NOT set in Railway (or set to `/api`)

**Fix:**
- If `VITE_API_URL` is set to `localhost:3001` in Railway, remove it or change to `/api`

### If CORS errors appear

**Check:**
1. Railway logs for CORS errors
2. Browser console for CORS messages
3. Verify you're accessing via HTTPS (not HTTP)

**Fix:**
- Make sure you're using `https://` URL
- Check Railway logs for "HTTPS required in production" messages

### If static files still 404

**Check:**
1. Railway logs for "Fixed HTML asset paths" message
2. Verify dist folder exists: `✅ Found dist directory`
3. Check assets exist: `📦 Assets directory contents`

**Fix:**
- Check Railway build logs to ensure `npm run build` completed
- Verify dist folder was created

## ✅ Success Criteria

After deployment, you should have:

- ✅ No `ERR_CONNECTION_REFUSED` errors
- ✅ No `localhost:3001` in API calls
- ✅ API calls go to `/api/...` (relative URL)
- ✅ Static files load correctly (200 status)
- ✅ Login works
- ✅ No CORS errors
- ✅ Application loads and functions correctly

## 📝 Quick Test Commands

After deployment, you can test the API directly:

```bash
# Test health endpoint
curl https://your-railway-url.up.railway.app/api/health

# Should return: {"status":"OK",...}
```

## 🎯 Expected Timeline

- **Build time:** 5-10 minutes
- **Testing:** 2-3 minutes
- **Total:** ~15 minutes

If everything works, you're done! 🎉

If issues persist, check the troubleshooting section above or review Railway logs for specific error messages.
