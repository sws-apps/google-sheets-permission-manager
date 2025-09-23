# Railway Deployment Guide

## Quick Deploy Steps

### 1. Deploy via GitHub Integration

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose: `sws-apps/google-sheets-permission-manager`
5. Railway will auto-detect the monorepo structure

### 2. Deploy Backend Service

Create a new service for the backend:
- **Service Name**: `backend`
- **Root Directory**: `/backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Deploy Frontend Service

Create another service for the frontend:
- **Service Name**: `frontend`
- **Root Directory**: `/frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s build -l $PORT`

## Environment Variables

### Backend Service - REQUIRED Variables:

```env
# Port (Railway provides this automatically)
PORT=<auto-assigned>

# Google OAuth2 Credentials (REQUIRED)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=generate_random_32_char_string_here

# Frontend URL (will be your Railway frontend URL)
FRONTEND_URL=https://frontend-production-xxxx.up.railway.app

# Google OAuth Redirect URI
GOOGLE_REDIRECT_URI=https://backend-production-xxxx.up.railway.app/api/auth/google/callback

# API Scopes
GOOGLE_SCOPES=https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets

# Node Environment
NODE_ENV=production

# Optional: Server Authentication (for no-login mode)
# Generate using npm run get-tokens locally first
# GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

### Frontend Service - REQUIRED Variables:

```env
# Backend API URL (your Railway backend URL)
REACT_APP_API_URL=https://backend-production-xxxx.up.railway.app

# Node Environment
NODE_ENV=production
```

## Post-Deployment Setup

### 1. Update Google Cloud Console

After deployment, update your OAuth2 credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add these Authorized redirect URIs:
   - `https://backend-production-xxxx.up.railway.app/api/auth/google/callback`
   - `https://your-backend-url.railway.app/api/auth/google/callback`

### 2. Update Environment Variables

After getting your Railway URLs:
1. Update `FRONTEND_URL` in backend service
2. Update `REACT_APP_API_URL` in frontend service
3. Update `GOOGLE_REDIRECT_URI` in backend service

### 3. Generate Session Secret

Generate a secure session secret:
```bash
openssl rand -base64 32
```

## Verification Steps

1. **Check Backend Health**:
   ```
   curl https://your-backend-url.railway.app/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Check Auth Status**:
   ```
   curl https://your-backend-url.railway.app/api/auth/server-status
   ```

3. **Access Frontend**:
   Visit: `https://your-frontend-url.railway.app`

## Alternative: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend (in new service)
cd ../frontend
railway up

# Link and configure services
railway link
railway variables set NODE_ENV=production
railway variables set GOOGLE_CLIENT_ID=your_client_id
# ... set other variables
```

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` is correctly set in backend
- Check that Railway domains are whitelisted in backend CORS config

### Authentication Errors
- Verify Google OAuth credentials are correct
- Ensure redirect URIs match exactly in Google Console
- Check SESSION_SECRET is set

### Build Failures
- Ensure Node version >= 18
- Check npm dependencies are installed
- Verify TypeScript builds successfully locally first

## Required Google APIs
Make sure these are enabled in Google Cloud Console:
- Google Drive API
- Google Sheets API (for cell reading features)

## Security Notes
- Never commit `.env` files
- Use Railway's environment variable management
- Rotate SESSION_SECRET periodically
- Use dedicated Google account for server auth mode

## Support
For deployment issues:
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Ensure Google APIs are enabled
- Check domain whitelist in CORS configuration