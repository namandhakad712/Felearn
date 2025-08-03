# 🚀 Deployment Guide for Felearn AI

This guide covers deploying Felearn AI to various platforms, with a focus on Vercel (recommended).

## 📋 Pre-Deployment Checklist

### ✅ **Environment Variables**
Ensure you have all required environment variables:

```env
# Appwrite Configuration (Required)
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_STORIES_ID=your_stories_collection_id
VITE_APPWRITE_COLLECTION_USERS_ID=your_users_collection_id
VITE_APPWRITE_BUCKET_STORY_IMAGES_ID=your_bucket_id

# Optional: Analytics & Monitoring
VITE_VERCEL_ANALYTICS_ID=your_analytics_id
```

### ✅ **Build Test**
Test your build locally:
```bash
npm run build
npm run preview
```

### ✅ **Appwrite Setup**
- ✅ Database collections created
- ✅ Storage bucket configured
- ✅ Authentication providers enabled
- ✅ API keys and permissions set

---

## 🎯 Vercel Deployment (Recommended)

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Felearn AI" project

3. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all your environment variables
   - Set them for Production, Preview, and Development

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add VITE_APPWRITE_ENDPOINT
   vercel env add VITE_APPWRITE_PROJECT_ID
   # ... add all other variables
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Custom Domain Setup

1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update DNS Records:**
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

3. **Update Environment Variables:**
   - Update any hardcoded URLs to use your custom domain

---

## 🌐 Alternative Deployment Options

### Netlify

1. **Build the Project:**
   ```bash
   npm run build
   ```

2. **Deploy via Drag & Drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to deploy

3. **Or Connect GitHub:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

4. **Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add all required variables

### Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure `firebase.json`:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Build and Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

### AWS S3 + CloudFront

1. **Build the Project:**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket:**
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `index.html`

3. **Upload Files:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure CloudFront:**
   - Create distribution pointing to S3 bucket
   - Set default root object to `index.html`
   - Configure custom error pages for SPA routing

### Docker Deployment

1. **Create `Dockerfile`:**
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create `nginx.conf`:**
   ```nginx
   events {
     worker_connections 1024;
   }

   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;

     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
         try_files $uri $uri/ /index.html;
       }

       location /public/ {
         expires 1y;
         add_header Cache-Control "public, immutable";
       }
     }
   }
   ```

3. **Build and Run:**
   ```bash
   docker build -t felearn-ai .
   docker run -p 80:80 felearn-ai
   ```

---

## 🔧 Environment-Specific Configurations

### Production Optimizations

1. **Update `vite.config.ts`:**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             router: ['react-router-dom'],
             ui: ['framer-motion', 'styled-components']
           }
         }
       },
       chunkSizeWarningLimit: 1000
     },
     define: {
       'process.env.NODE_ENV': '"production"'
     }
   });
   ```

2. **Enable Compression:**
   ```typescript
   import { defineConfig } from 'vite';
   import { compression } from 'vite-plugin-compression';

   export default defineConfig({
     plugins: [
       react(),
       compression({
         algorithm: 'gzip'
       })
     ]
   });
   ```

### Staging Environment

1. **Create `.env.staging`:**
   ```env
   VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_staging_project_id
   # ... other staging variables
   ```

2. **Deploy to Staging:**
   ```bash
   vercel --env .env.staging
   ```

---

## 📊 Post-Deployment Setup

### 1. **Domain Configuration**
- Set up custom domain
- Configure SSL certificate
- Update CORS settings in Appwrite

### 2. **Analytics Setup**
```typescript
// Add to main.tsx
import { inject } from '@vercel/analytics';

inject();
```

### 3. **Error Monitoring**
```typescript
// Add error boundary and monitoring
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production'
});
```

### 4. **Performance Monitoring**
- Set up Vercel Analytics
- Configure Core Web Vitals tracking
- Monitor bundle size and loading times

---

## 🔍 Troubleshooting Deployment Issues

### Common Build Errors

**1. Environment Variables Not Found**
```bash
Error: VITE_APPWRITE_ENDPOINT is not defined
```
**Solution:** Ensure all environment variables are set in your deployment platform.

**2. Build Size Too Large**
```bash
Warning: Bundle size exceeds recommended limit
```
**Solution:** Enable code splitting and compression:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```

**3. Routing Issues (404 on Refresh)**
**Solution:** Configure proper rewrites in your hosting platform.

**4. CORS Errors**
**Solution:** Update Appwrite platform settings to include your production domain.

### Performance Issues

**1. Slow Initial Load**
- Enable lazy loading for routes
- Implement code splitting
- Optimize images and assets

**2. Large Bundle Size**
- Analyze bundle with `npm run build -- --analyze`
- Remove unused dependencies
- Use dynamic imports

### Security Checklist

- ✅ HTTPS enabled
- ✅ Security headers configured
- ✅ API keys secured
- ✅ CORS properly configured
- ✅ Content Security Policy set

---

## 📈 Monitoring & Maintenance

### 1. **Set Up Monitoring**
- Vercel Analytics for performance
- Sentry for error tracking
- Uptime monitoring service

### 2. **Regular Updates**
```bash
# Update dependencies monthly
npm update
npm audit fix

# Update Node.js version as needed
# Update deployment platform settings
```

### 3. **Backup Strategy**
- Regular database backups
- Source code in version control
- Environment variables documented

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Build passes locally
- [ ] Tests passing
- [ ] Appwrite collections and buckets set up
- [ ] Domain and SSL configured

### Post-Deployment
- [ ] App loads correctly
- [ ] Authentication works
- [ ] Story generation functional
- [ ] File uploads working
- [ ] All routes accessible
- [ ] Mobile responsive
- [ ] Performance metrics acceptable

### Ongoing Maintenance
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Update dependencies regularly
- [ ] Backup data regularly
- [ ] Monitor costs and usage

---

## 🆘 Getting Help

If you encounter issues during deployment:

1. **Check the logs** in your deployment platform
2. **Verify environment variables** are correctly set
3. **Test locally** with production build
4. **Check Appwrite console** for API errors
5. **Contact support** if issues persist

### Support Channels
- 📧 Email: support@felearn.ai
- 💬 Discord: [Join our community](https://discord.gg/felearn)
- 🐛 GitHub Issues: [Report bugs](https://github.com/yourusername/felearn-ai/issues)

---

**Happy Deploying! 🚀**