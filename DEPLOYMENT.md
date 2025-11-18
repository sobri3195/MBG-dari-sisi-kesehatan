# Deployment Guide - MBG Health Security System

## Quick Deploy to Netlify

### Option 1: One-Click Deploy (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

### Option 2: Git Integration

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Choose your Git provider and repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

3. **Your site will be live at**: `https://[random-name].netlify.app`
   - You can customize the domain in site settings

### Option 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   # Build the project
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod --dir=dist
   ```

### Option 4: Drag & Drop

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder to the upload area
   - Your site will be deployed instantly!

## Environment Configuration

No environment variables needed! This is a fully client-side application using LocalStorage.

## Custom Domain Setup

1. Go to your site settings in Netlify
2. Navigate to "Domain management"
3. Click "Add custom domain"
4. Follow the DNS configuration instructions

## Continuous Deployment

Once connected via Git, Netlify will automatically deploy on every push to your repository.

### Branch Deploys
- `main` branch → Production
- Other branches → Deploy previews (optional)

## Build Configuration Files

The project includes:
- `netlify.toml` - Main Netlify configuration
- `public/_redirects` - SPA routing configuration (redirects all routes to index.html)

## Monitoring & Analytics

1. **Netlify Analytics**
   - Enable in site settings
   - Track page views, bandwidth, etc.

2. **Netlify Forms** (Optional)
   - Can be added for feedback forms
   - No server-side code needed

## Troubleshooting

### Build fails with "command not found"
- Ensure `package.json` has correct scripts
- Build command should be: `npm run build`

### 404 on refresh
- Check that `public/_redirects` exists
- Or use `netlify.toml` configuration

### LocalStorage data not persisting
- LocalStorage is browser-specific
- Data will be cleared if user clears browser data
- Consider adding export/import functionality

## Performance Optimization

The build is already optimized with:
- Code splitting via Vite
- Minified JS and CSS
- Compressed assets

### Further optimizations:
1. Enable Netlify's asset optimization
2. Use Netlify's CDN (automatic)
3. Enable HTTPS (automatic)

## Cost

**FREE tier includes:**
- 100 GB bandwidth/month
- Unlimited sites
- HTTPS
- Continuous deployment
- Forms (100 submissions/month)

Perfect for this application!

## Support

For Netlify-specific issues:
- Documentation: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://www.netlifystatus.com

## Next Steps After Deployment

1. Load demo data using the sidebar button
2. Test all features (Personnel, Screening, Entry Check, Incidents)
3. Share the URL with your team
4. Customize as needed

Enjoy your deployed MBG Health Security System! 🚀
