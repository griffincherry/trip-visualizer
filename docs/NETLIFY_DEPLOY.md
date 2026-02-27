# Netlify Deployment Guide

## Quick Deploy

### Option 1: Drag & Drop (Easiest)

1. **Extract the ZIP file** `europe-trip-netlify.zip`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. **Drag the entire extracted folder** onto the page
4. Netlify will automatically:
   - Detect it's a Vite project
   - Run `npm install`
   - Run `npm run build`
   - Deploy the `dist` folder
5. Your site will be live in ~2 minutes! 🎉

### Option 2: GitHub (Recommended for Updates)

1. **Create a new GitHub repository**
2. **Extract and push** the contents:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```
3. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repo
   - Build settings will auto-detect:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

## Build Configuration

Your `package.json` already has the correct build script:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Netlify will automatically:
- Install dependencies with `npm install`
- Build with `npm run build`
- Serve the `dist` folder

## Environment Variables

No environment variables needed! The app uses:
- **OpenRailRouting API** (public, no key required)
- **OSRM** (public, no key required)
- **Leaflet** (via CDN)
- **Map tiles** (public CDN)

## Netlify Configuration (Optional)

If you want to add a `netlify.toml` for explicit settings:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures client-side routing works correctly.

## Troubleshooting

### Build Fails
- Check the Netlify build log
- Most common issue: Node version
- Solution: Add a `.nvmrc` file with `20` (Node 20)

### Routes Don't Work
- Add the `netlify.toml` redirect rule above
- This ensures the SPA routing works

### API Calls Fail
- OpenRailRouting may be slow/rate-limited
- The app has OSRM fallback built-in
- No action needed - routes will still display

## Custom Domain (Optional)

After deployment:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS setup instructions

## Performance

Expected Lighthouse scores:
- **Performance:** 90-100 (Vite optimizes bundle)
- **Best Practices:** 95-100
- **SEO:** 90-100

## Updates

To update your site:
- **Drag & Drop:** Just drag the new folder again
- **GitHub:** Push changes, Netlify auto-rebuilds

## Support

If you encounter issues:
1. Check [Netlify Status](https://netlifystatus.com)
2. Review build logs in Netlify dashboard
3. Check that all files were uploaded correctly

---

**Your app is ready to deploy!** Just extract the ZIP and drag it to Netlify. 🚀
