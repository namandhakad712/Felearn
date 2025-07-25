# Universal OAuth Setup Guide

This guide shows how to configure OAuth providers to work on **any domain** (localhost, staging, production).

## 🌐 Universal URL System

The app now uses **dynamic URLs** that automatically adapt to any domain:

- **Development**: `http://localhost:5173/auth/callback`
- **Staging**: `https://staging.yourapp.com/auth/callback`
- **Production**: `https://yourapp.com/auth/callback`

## 🔧 Appwrite Console Setup

### 1. Access Appwrite Console
- Go to [Appwrite Console](https://cloud.appwrite.io)
- Select your project: **felearn**

### 2. Configure Google OAuth

1. **Navigate to**: Auth → Settings → Google
2. **Enable**: Toggle ON
3. **Redirect URLs**: Add ALL your domains:
   ```
   http://localhost:5173/auth/callback
   http://localhost:3000/auth/callback
   https://staging.yourapp.com/auth/callback
   https://yourapp.com/auth/callback
   ```
4. **Google Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add the same redirect URLs

### 3. Configure GitHub OAuth

1. **Navigate to**: Auth → Settings → GitHub
2. **Enable**: Toggle ON
3. **Redirect URLs**: Add ALL your domains:
   ```
   http://localhost:5173/auth/callback
   https://staging.yourapp.com/auth/callback
   https://yourapp.com/auth/callback
   ```
4. **GitHub Setup**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Add the same redirect URLs

## 🚀 Environment Variables

Create `.env` files for each environment:

### Development (.env.local)
```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=felearn
```

### Production (.env.production)
```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=felearn
```

## 🔍 Testing OAuth

### Local Testing
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:5173/auth/login`
3. Click Google/GitHub buttons
4. Should redirect to provider → back to callback

### Production Testing
1. Deploy your app
2. Update OAuth provider settings with production URL
3. Test the same flow

## 🐛 Debugging

The app logs useful debug information:

```javascript
// Check browser console for:
🚀 App Configuration: { environment, baseUrl, authUrls }
🔧 Appwrite Configuration: { endpoint, project, environment }
🌐 Dynamic URLs: { oauthCallback, emailVerify, etc. }
```

## 📝 OAuth Flow

1. **User clicks OAuth button**
2. **App redirects to**: `https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/google/felearn`
3. **User authenticates** with Google/GitHub
4. **Provider redirects to**: `{YOUR_DOMAIN}/auth/callback`
5. **App handles callback** and creates user account
6. **Redirects to**: Dashboard or Onboarding

## ✅ Universal Benefits

- ✅ **Works on any domain** (localhost, staging, production)
- ✅ **No hardcoded URLs** - everything is dynamic
- ✅ **Environment detection** - automatically detects dev/staging/prod
- ✅ **Easy deployment** - no URL changes needed
- ✅ **Debug logging** - easy to troubleshoot issues

## 🔧 Adding New Domains

To add a new domain (e.g., `https://newdomain.com`):

1. **Add to Appwrite Console**: Auth → Settings → [Provider] → Add redirect URL
2. **Add to OAuth Provider**: Google/GitHub console → Add redirect URL
3. **Deploy app** - URLs automatically work!

No code changes needed! 🎉