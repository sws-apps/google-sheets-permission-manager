# 🚀 Deploy to Railway - Quick Start Guide

## Option 1: One-Click Deploy (Recommended)

### Step 1: Deploy from GitHub
1. **Open Railway**: https://railway.app/new
2. **Click**: "Deploy from GitHub repo"
3. **Search for**: `sws-apps/google-sheets-permission-manager`
4. **Select the repository**

### Step 2: Configure Services
Railway will detect the monorepo. Create two services:

#### Backend Service:
- **Name**: `backend`
- **Root Directory**: `/backend`
- **Start Command**: Leave empty (auto-detected)

#### Frontend Service:
- **Name**: `frontend`  
- **Root Directory**: `/frontend`
- **Start Command**: Leave empty (auto-detected)

### Step 3: Set Environment Variables

#### For Backend Service - Click "Variables" and add:
```
GOOGLE_CLIENT_ID=<paste your Google client ID>
GOOGLE_CLIENT_SECRET=<paste your Google client secret>
SESSION_SECRET=<generate with: openssl rand -base64 32>
FRONTEND_URL=<will be shown after frontend deploys>
GOOGLE_REDIRECT_URI=<your-backend-url>/api/auth/google/callback
GOOGLE_SCOPES=https://www.googleapis.com/auth/drive
NODE_ENV=production
```

#### For Frontend Service - Click "Variables" and add:
```
REACT_APP_API_URL=<your backend URL from Railway>
NODE_ENV=production
```

### Step 4: Deploy
Click "Deploy" for each service. Railway will build and deploy automatically.

## Option 2: Using Railway CLI

```bash
# 1. Open terminal in project directory
cd /Users/kmh/google-sheets-permission-manager

# 2. Run the deployment script
./deploy-to-railway.sh

# 3. Follow the prompts to login and deploy
```

## Your Google OAuth Credentials

You'll need these from Google Cloud Console:
1. Go to: https://console.cloud.google.com
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Copy your OAuth 2.0 Client ID and Secret

## After Deployment

### 1. Get Your URLs
Railway will provide URLs like:
- Backend: `https://backend-production-xxxx.up.railway.app`
- Frontend: `https://frontend-production-xxxx.up.railway.app`

### 2. Update Google Cloud Console
Add this redirect URI to your OAuth client:
```
https://[your-backend-url]/api/auth/google/callback
```

### 3. Update Environment Variables
Go back to Railway and update:
- Backend: Set `FRONTEND_URL` to your frontend URL
- Frontend: Set `REACT_APP_API_URL` to your backend URL

### 4. Redeploy
Click "Redeploy" on each service to apply the new variables.

## Verification
1. Visit your frontend URL
2. You should see the Google Sheets Permission Manager interface
3. Test with the single sheet processor first

## Need Your Google Credentials?

Create new ones:
1. Go to: https://console.cloud.google.com
2. Create new project or select existing
3. Enable APIs: Google Drive API
4. Create credentials → OAuth 2.0 Client ID → Web application
5. Add authorized redirect URI: `https://[your-backend].railway.app/api/auth/google/callback`

## Session Secret Generator

Run this command to generate a secure session secret:
```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.now.sh/32

---

## 🎯 Quick Deploy Checklist

- [ ] Open https://railway.app/new
- [ ] Deploy from GitHub: `sws-apps/google-sheets-permission-manager`
- [ ] Create backend service (root: /backend)
- [ ] Create frontend service (root: /frontend)
- [ ] Set Google OAuth credentials in backend
- [ ] Set API URL in frontend
- [ ] Deploy both services
- [ ] Update Google Cloud Console with redirect URI
- [ ] Test the deployment

Your app will be live in about 5-10 minutes!