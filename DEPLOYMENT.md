# Task Manager - Deployment Guide

## Prerequisites for Deployment

- GitHub repository with your code
- Firebase project configured (see main README.md)
- Vercel or Netlify account (free tier works)

## Deploying to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables in Project Settings → Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

6. Click "Deploy"

## Deploying to Netlify

### Option 1: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize**:
   ```bash
   netlify init
   ```

4. **Set Environment Variables**:
   ```bash
   netlify env:set VITE_FIREBASE_API_KEY "your_value"
   netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_value"
   netlify env:set VITE_FIREBASE_PROJECT_ID "your_value"
   netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_value"
   netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your_value"
   netlify env:set VITE_FIREBASE_APP_ID "your_value"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

5. Add Environment Variables in Site Settings → Build & deploy → Environment:
   - All `VITE_FIREBASE_*` variables

6. Click "Deploy site"

## netlify.toml Configuration

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Post-Deployment Checklist

- [ ] Verify Firebase Authentication works
- [ ] Test task creation, editing, deletion
- [ ] Check all filters and search functionality
- [ ] Test on mobile devices
- [ ] Verify error handling
- [ ] Check browser console for errors
- [ ] Test logout and re-login
- [ ] Verify real-time updates work

## Firebase Configuration for Production

### Update Authorized Domains

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel/Netlify domain (e.g., `your-app.vercel.app`)

### Firestore Security Rules

Ensure your Firestore rules are production-ready:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Users can only read/write their own tasks
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      // Allow creating tasks for authenticated users
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Push to main branch**: Auto-deploys to production
- **Push to other branches**: Creates preview deployments
- **Pull requests**: Creates preview URLs

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics

### Error Tracking

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage stats

## Domain Configuration

### Custom Domain (Optional)

1. **Vercel**: Project Settings → Domains → Add domain
2. **Netlify**: Site Settings → Domain management → Add custom domain

## Troubleshooting Deployment

### Build Fails

```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run build -- --mode production
```

### Environment Variables Not Working

- Ensure variables start with `VITE_`
- Redeploy after adding env vars
- Check variable names match exactly

### Firebase Connection Issues

- Verify all 6 Firebase env variables are set
- Check Firebase project has Authentication and Firestore enabled
- Verify domain is in Firebase authorized domains list

## Security Best Practices

1. **Never commit** `.env` file
2. **Use environment variables** for all secrets
3. **Enable Firestore security rules**
4. **Keep dependencies updated**: `npm audit fix`
5. **Enable HTTPS** (automatic on Vercel/Netlify)

## Cost Considerations

### Free Tier Limits

**Vercel Free**:
- 100 GB bandwidth/month
- Unlimited websites
- Automatic HTTPS

**Netlify Free**:
- 100 GB bandwidth/month
- 300 build minutes/month
- Automatic HTTPS

**Firebase Free (Spark)**:
- 10k document writes/day
- 50k document reads/day
- 1 GB storage

For most projects, free tiers are sufficient!

## Support

If you encounter issues:
1. Check the main README.md troubleshooting section
2. Review Vercel/Netlify deployment logs
3. Check Firebase Console for errors
4. Ensure all environment variables are set correctly
