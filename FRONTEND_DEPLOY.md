# 🎨 Frontend Deployment to Railway

## Step 1: Create Frontend Service in Railway

1. Go to your Railway project dashboard
2. Click **"+ New"** → **"GitHub Repo"**
3. Select the same repo: `sws-apps/google-sheets-permission-manager`
4. **IMPORTANT**: Set the service name to `frontend`

## Step 2: Configure Frontend Service

In the new frontend service:

### Set Root Directory:
- Click **Settings** tab
- Find **"Root Directory"**
- Set to: `/frontend`
- Save

### Set Environment Variables:
Go to **Variables** tab and add:

```
REACT_APP_API_URL=https://google-sheets-permission-manager-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
```

## Step 3: Deploy

Click **"Deploy"** button. Railway will:
1. Install dependencies
2. Build the React app
3. Serve it using the serve package

## Step 4: Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. You'll get a URL like: `frontend-production-xxxx.up.railway.app`

## Step 5: Update Backend FRONTEND_URL

Go back to your **backend service** in Railway:
1. Go to **Variables** tab
2. Update:
```
FRONTEND_URL=https://[your-frontend-url].up.railway.app
```
3. Backend will auto-redeploy

## Step 6: Update Google Cloud Console

Add your frontend URL to allowed JavaScript origins:
1. Go to https://console.cloud.google.com
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://[your-frontend-url].up.railway.app`
5. Save

## Environment Variables Summary

### Frontend needs:
```
REACT_APP_API_URL=https://google-sheets-permission-manager-production.up.railway.app
NODE_ENV=production
PORT=${{PORT}}
```

### Backend needs (update):
```
FRONTEND_URL=https://[your-frontend-url].up.railway.app
```

## Testing

Once deployed, visit your frontend URL and you should see the Google Sheets Permission Manager interface!

Test the flow:
1. Click "Sign in with Google"
2. Authorize the app
3. Try processing a single sheet
4. Test batch upload

## Troubleshooting

### Blank Page
- Check browser console for errors
- Verify REACT_APP_API_URL is set correctly

### CORS Errors
- Make sure FRONTEND_URL is updated in backend
- Check that backend has redeployed with new variable

### Authentication Errors
- Verify frontend URL is in Google Console's authorized origins
- Check redirect URI includes backend URL

Your frontend URL will be: `https://frontend-production-xxxx.up.railway.app`