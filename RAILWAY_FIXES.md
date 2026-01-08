# Railway Deployment Fixes

## Issues Fixed

### 1. Static Files MIME Type Error (FIXED)
**Issue**: JavaScript and CSS files being served with `application/json` MIME type (404 JSON response) or `text/html`, causing "Failed to load module script" errors and 404s.

**Root Cause**: 
- Static files not found (404) → catch-all route returning JSON response
- OR dist folder not being found in Railway's working directory

**Fixes Applied**:
- Added explicit MIME type headers for static files (JS, CSS, JSON, SVG)
- Changed catch-all route to return plain text 404 (not JSON) for static files
- Added intelligent path detection for dist folder (checks multiple possible locations)
- Added comprehensive logging to diagnose file location issues
- Excluded static asset paths from catch-all route properly

**Important**: 
- Railway build command must run: `npm install && NODE_ENV=production npm run build`
- Check Railway logs for "✅ Found dist directory at:" message
- Verify "📦 Assets directory contents" lists your JS/CSS files

### 2. Tailwind CDN Warning
**Issue**: Warning about `cdn.tailwindcss.com` not being used in production.

**Fix**: 
- Tailwind CSS is already properly configured via PostCSS (not using CDN)
- The build process correctly compiles Tailwind into the CSS bundle
- If you still see this warning, it might be from a browser extension or dev tools
- **Action**: Rebuild the frontend with `npm run build` to ensure latest build

### 2. Mixed Content Warning
**Issue**: Page loaded over HTTPS but requested insecure elements.

**Fixes Applied**:
- Added `crossorigin="anonymous"` to Google Fonts link
- Added `Content-Security-Policy` meta tag with `upgrade-insecure-requests` to force HTTPS
- Added `trust proxy` setting in Express for Railway's proxy
- Added security headers middleware to force HTTPS redirects in production
- Ensured all Cloudinary URLs are returned as HTTPS

### 3. 500 Internal Server Error on `/api/upload/single`
**Issue**: Upload endpoint returning 500 error.

**Fixes Applied**:
- Improved CORS configuration for Railway deployment
- Enhanced error messages with detailed information
- Added better logging for debugging
- Increased body parser limits (10MB) for image uploads
- Added validation for Cloudinary configuration
- Ensured HTTPS URLs are returned from Cloudinary
- Added specific error messages for missing Cloudinary credentials

## Railway Environment Variables Required

Make sure these are set in your Railway project:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Next Steps

1. **Rebuild the frontend locally** (optional, for testing):
   ```bash
   npm run build
   ```

2. **Configure Railway Build Command**:
   - Go to Railway project → Settings → Build & Deploy
   - Ensure the build command includes: `npm run build`
   - Railway should run: `npm install && npm run build`
   - The `dist` folder must be created during the build process

3. **Redeploy to Railway**:
   - Push your changes to GitHub
   - Railway will automatically rebuild and redeploy
   - Check Railway logs to verify:
     - ✅ Dist directory exists
     - ✅ Assets directory contents are listed

3. **Verify Cloudinary credentials**:
   - Check Railway dashboard → Variables tab
   - Ensure all three Cloudinary variables are set
   - Check server logs for Cloudinary configuration status

4. **Test the upload endpoint**:
   - Try uploading an image
   - Check browser console for any errors
   - Check Railway logs for detailed error messages

## Testing

After deployment, test:
- ✅ Page loads without Tailwind CDN warnings
- ✅ No mixed content warnings in console
- ✅ Image upload works without 500 errors
- ✅ All resources load over HTTPS

## Troubleshooting

### If static files still show MIME type errors or 404s:
1. **Check Railway build logs** - Verify `npm run build` ran successfully
   - Look for "vite build" output
   - Should see "dist" folder being created
   
2. **Check Railway server logs** - Look for:
   - "✅ Found dist directory at: [path]" (should show the path)
   - "📦 Dist directory contents: [files]" (should list index.html, assets, etc.)
   - "📦 Assets directory contents: [files]" (should list your JS/CSS files)
   - "📄 Static file request: /assets/..." (shows if files are found)
   
3. **If dist not found**, check:
   - Railway build command in `railway.json`: `npm install && NODE_ENV=production npm run build`
   - Railway project settings → Build command should match
   - Working directory in Railway (might need to adjust path)
   
4. **Verify dist folder structure** - Should have:
   - `dist/index.html`
   - `dist/assets/index-*.js`
   - `dist/assets/index-*.css`
   
5. **Check browser Network tab**:
   - Look at the actual request URL
   - Check response headers (should be correct MIME type, not application/json)
   - Verify status code (should be 200, not 404)
   
6. **If files still 404**:
   - The dist folder might be in a different location
   - Check Railway logs for "Current working directory" and "__dirname"
   - May need to adjust the dist path in server/index.js

### If upload still fails:
1. Check Railway logs for Cloudinary configuration status
2. Verify Cloudinary credentials are correct
3. Check file size (limit is 5MB)
4. Ensure file format is supported (JPEG, PNG, GIF, WEBP)
5. Check CORS headers in browser network tab
