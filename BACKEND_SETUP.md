# Backend Setup Guide for Railway

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** or select existing one
3. **Enable these APIs**:
   - Click "APIs & Services" → "Library"
   - Search and enable:
     - ✅ Google Drive API
     - ✅ Google Sheets API (optional, for reading cell data)

### 1.2 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first:
   - User Type: External
   - App name: Google Sheets Permission Manager
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add these:
     - `https://www.googleapis.com/auth/drive`
     - `https://www.googleapis.com/auth/spreadsheets`
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Google Sheets Manager - Production`
   - Authorized JavaScript origins: 
     ```
     https://your-frontend.railway.app
     ```
   - Authorized redirect URIs (add these for now):
     ```
     http://localhost:5001/api/auth/google/callback
     http://localhost:5000/api/auth/google/callback
     https://your-backend.railway.app/api/auth/google/callback
     ```
   - Click **"CREATE"**

5. **SAVE THESE VALUES**:
   ```
   Client ID: [Your Client ID will appear here]
   Client Secret: [Your Client Secret will appear here]
   ```

## Step 2: Deploy Backend on Railway

### 2.1 Create Railway Project

1. **Open Railway**: https://railway.app/new
2. **Select**: "Deploy from GitHub repo"
3. **Search**: `sws-apps/google-sheets-permission-manager`
4. **Select** the repository

### 2.2 Configure Backend Service

1. Railway will detect the monorepo
2. **Create a new service**:
   - Name: `backend`
   - Root Directory: `/backend`
   - Click **"Create Service"**

### 2.3 Set Environment Variables

Click on your backend service, then go to **"Variables"** tab and add these:

```bash
# REQUIRED - Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here

# REQUIRED - Session Secret (generate below)
SESSION_SECRET=paste_generated_secret_here

# REQUIRED - API Scopes
GOOGLE_SCOPES=https://www.googleapis.com/auth/drive

# REQUIRED - Node Environment
NODE_ENV=production

# TEMPORARY - Will update after deployment
FRONTEND_URL=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:5001/api/auth/google/callback

# Port (Railway provides this automatically)
PORT=${{PORT}}
```

### 2.4 Generate Session Secret

Run this command in terminal:
```bash
openssl rand -base64 32
```

Or use this value (replace with your own for production):
```
Kg7Hb3Zr9TqL2NpX5MvW8YnA4JdF6SeCfGhUjKmBnVcR
```

### 2.5 Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (~3-5 minutes)
3. Once deployed, Railway will show your backend URL like:
   ```
   https://backend-production-xxxx.up.railway.app
   ```

## Step 3: Update Configuration

### 3.1 Update Railway Environment Variables

Once you have your backend URL, update these variables:

```bash
# Update this with your actual Railway backend URL
GOOGLE_REDIRECT_URI=https://backend-production-xxxx.up.railway.app/api/auth/google/callback

# Update this with your frontend URL (if deployed)
FRONTEND_URL=https://frontend-production-yyyy.up.railway.app
# Or keep as http://localhost:3000 for local testing
```

### 3.2 Update Google Cloud Console

1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add your Railway backend redirect URI:
   ```
   https://backend-production-xxxx.up.railway.app/api/auth/google/callback
   ```
4. Save changes

## Step 4: Test Your Backend

### 4.1 Health Check
```bash
curl https://your-backend-url.railway.app/api/health
```
Should return:
```json
{"status":"OK","message":"Server is running"}
```

### 4.2 Auth Status Check
```bash
curl https://your-backend-url.railway.app/api/auth/server-status
```
Should return auth configuration status

## Step 5: Optional - Server Authentication

To enable no-login mode (users don't need to sign in):

### 5.1 Generate Refresh Token Locally

1. Make sure backend/.env has your Google credentials
2. Run:
   ```bash
   cd backend
   npm run get-tokens
   ```
3. Follow the prompts to authenticate
4. Copy the refresh token

### 5.2 Add to Railway

Add this variable to your backend service:
```bash
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

## Environment Variables Summary

Here's the complete list for copy-paste into Railway:

```env
# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret

# Security (REQUIRED)
SESSION_SECRET=generate_with_openssl_rand_base64_32

# URLs (Update after deployment)
FRONTEND_URL=https://your-frontend.railway.app
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/api/auth/google/callback

# API Configuration
GOOGLE_SCOPES=https://www.googleapis.com/auth/drive

# Environment
NODE_ENV=production
PORT=${{PORT}}

# Optional - Server Auth
# GOOGLE_REFRESH_TOKEN=optional_refresh_token
```

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Console EXACTLY matches your Railway backend URL
- No trailing slashes
- Must include `/api/auth/google/callback`

### CORS Errors
- Ensure FRONTEND_URL is set correctly in Railway
- Check that your frontend URL is whitelisted

### Cannot Connect to Backend
- Check Railway logs: Click service → "Logs" tab
- Verify environment variables are set
- Ensure Google APIs are enabled

## Quick Test URLs

Once deployed, test these endpoints:
1. Health: `https://[your-backend].railway.app/api/health`
2. Auth Status: `https://[your-backend].railway.app/api/auth/server-status`

## Need Help?

1. Check Railway logs for errors
2. Verify all environment variables are set
3. Ensure Google Cloud Console has correct redirect URIs
4. Test with curl commands above

---

## 🎯 Quick Checklist

- [ ] Created Google OAuth credentials
- [ ] Enabled Google Drive API
- [ ] Deployed backend to Railway
- [ ] Set all environment variables
- [ ] Updated Google Console redirect URIs
- [ ] Tested health endpoint
- [ ] Backend is running!

Your backend URL will be: `https://backend-production-xxxx.up.railway.app`