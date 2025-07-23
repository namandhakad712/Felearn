# Deployment Guide

This guide covers deploying the AI Storytelling Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Appwrite Instance**: Set up your Appwrite backend
4. **Environment Variables**: Prepare your configuration values

## Quick Start

### 1. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite project

### 2. Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

```bash
# Required Variables
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id

# Collection IDs
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_STORIES_COLLECTION_ID=stories
VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID=admin_logs
VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID=error_logs

# Optional: Sentry Configuration
VITE_SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production

# Application Configuration
VITE_APP_NAME=AI Storytelling Platform
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-app.vercel.app
```

### 3. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Manual Deployment

### Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

### Using Deployment Script

Run the automated deployment script:

```bash
# Development deployment
node scripts/deploy.js

# Production deployment
NODE_ENV=production node scripts/deploy.js --prod
```

## Build Configuration

### Vercel Configuration (`vercel.json`)

The project includes a `vercel.json` file with:

- **Build settings**: Optimized for Vite
- **Routing**: SPA routing configuration
- **Headers**: Security headers
- **Caching**: Static asset caching
- **Environment**: Production settings

### Build Process

The build process includes:

1. **Dependency installation**: `npm ci` for faster builds
2. **Environment validation**: Check required variables
3. **Application build**: `npm run build`
4. **Build optimization**: Bundle analysis and optimization
5. **Deployment**: Upload to Vercel

## Environment-Specific Configuration

### Development

```bash
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
VITE_ENABLE_ERROR_REPORTING=false
```

### Staging

```bash
VITE_DEV_MODE=false
VITE_DEBUG_MODE=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_SENTRY_ENVIRONMENT=staging
```

### Production

```bash
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_ENABLE_ERROR_REPORTING=true
VITE_SENTRY_ENVIRONMENT=production
```

## Preview Deployments

Vercel automatically creates preview deployments for:

- **Pull Requests**: Each PR gets a unique URL
- **Branch Deployments**: Push to any branch creates a preview
- **Commit Deployments**: Each commit gets a deployment URL

### Preview URLs

- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch.vercel.app`
- Commit: `https://your-project-commit-hash.vercel.app`

## Custom Domains

### Adding a Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### SSL Certificates

Vercel automatically provides SSL certificates for:
- `.vercel.app` domains
- Custom domains
- Wildcard certificates for subdomains

## Performance Optimization

### Build Optimization

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Compress images and assets
- **Caching**: Aggressive caching for static assets

### Runtime Optimization

- **Edge Network**: Global CDN distribution
- **Serverless Functions**: Fast cold starts
- **Image Optimization**: Automatic image optimization
- **Compression**: Gzip/Brotli compression

## Monitoring and Analytics

### Vercel Analytics

Enable Vercel Analytics for:
- Page views and user sessions
- Core Web Vitals monitoring
- Real User Monitoring (RUM)
- Performance insights

### Error Monitoring

The app includes Sentry integration for:
- Error tracking and reporting
- Performance monitoring
- Release tracking
- User feedback

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify dependencies in package.json
   - Review build logs in Vercel dashboard

2. **Runtime Errors**
   - Check browser console
   - Review Sentry error reports
   - Verify API endpoints

3. **Performance Issues**
   - Use Vercel Analytics
   - Check Core Web Vitals
   - Review bundle size

### Debug Mode

Enable debug mode for troubleshooting:

```bash
VITE_DEBUG_MODE=true
```

### Build Logs

Access build logs in:
- Vercel dashboard > Deployments > Build logs
- Vercel CLI: `vercel logs`

## Security

### Environment Variables

- Never commit `.env` files
- Use Vercel's environment variable system
- Separate variables by environment (dev/staging/prod)

### Security Headers

The app includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### HTTPS

- All deployments use HTTPS by default
- HTTP requests are automatically redirected
- HSTS headers are included

## Rollback and Recovery

### Rollback Deployment

1. Go to Vercel dashboard > Deployments
2. Find the previous working deployment
3. Click "Promote to Production"

### Instant Rollback

```bash
vercel rollback [deployment-url]
```

### Backup Strategy

- Git repository serves as source backup
- Vercel keeps deployment history
- Database backups handled by Appwrite

## CI/CD Integration

The deployment integrates with:
- **GitHub Actions**: Automated testing and deployment
- **Pull Request Previews**: Automatic preview deployments
- **Status Checks**: Build status in GitHub PRs

See `GITHUB_ACTIONS.md` for CI/CD pipeline details.