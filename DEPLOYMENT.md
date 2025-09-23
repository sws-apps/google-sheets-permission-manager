# Deployment Guide for Google Sheets Permission Manager

## Table of Contents
- [Railway Deployment](#railway-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Setup](#post-deployment-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Railway Deployment

This application is deployed on Railway with separate services for frontend and backend.

### Prerequisites
1. Railway account
2. GitHub repository connected to Railway
3. Google Cloud Console project with OAuth 2.0 credentials

### Backend Deployment

#### 1. Create Backend Service
1. Create new service in Railway
2. Connect to GitHub repository
3. Select the backend directory as root (if monorepo)

#### 2. Configure Environment Variables
Add the following environment variables in Railway:

```bash
# Required - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Required - Session Management
SESSION_SECRET=generate_random_32_char_string

# Required - CORS Configuration
FRONTEND_URL=https://your-frontend-url.railway.app

# Required - Server Configuration
NODE_ENV=production
PORT=8080  # Railway uses this port

# Optional - Server Authentication
GOOGLE_REFRESH_TOKEN=your_refresh_token_if_using_server_auth
```

#### 3. Configure Build & Deploy Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Health Check Timeout**: 300 seconds
- **Restart Policy**: ON_FAILURE with max 10 retries

#### 4. Railway Configuration Files
The backend includes these configuration files:
- `railway.toml` - Railway-specific configuration
- `nixpacks.toml` - Build environment configuration

### Frontend Deployment

#### 1. Create Frontend Service
1. Create another service in Railway
2. Connect to the same GitHub repository
3. Select the frontend directory as root (if monorepo)

#### 2. Configure Environment Variables
Add the following environment variables:

```bash
# Required - Backend API URL
REACT_APP_API_URL=https://your-backend-url.railway.app

# Required - Build Configuration
CI=false  # Prevents ESLint warnings from failing the build
```

#### 3. Configure Build & Deploy Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s build -l $PORT`
- **Root Directory**: `/frontend` (if monorepo)

#### 4. Frontend Configuration Files
The frontend includes:
- `nixpacks.toml` - Specifies Node.js version and build process

## Environment Configuration

### Development vs Production

#### Development Environment
```bash
# Backend .env
GOOGLE_CLIENT_ID=dev_client_id
GOOGLE_CLIENT_SECRET=dev_client_secret
SESSION_SECRET=dev_session_secret
FRONTEND_URL=http://localhost:3000
PORT=5001
NODE_ENV=development

# Frontend .env
REACT_APP_API_URL=http://localhost:5001
```

#### Production Environment (Railway)
```bash
# Backend Environment Variables
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
SESSION_SECRET=prod_session_secret_min_32_chars
FRONTEND_URL=https://frontend-production.railway.app
PORT=8080
NODE_ENV=production

# Frontend Environment Variables
REACT_APP_API_URL=https://backend-production.railway.app
CI=false
```

### Google OAuth Configuration

#### Update Authorized Redirect URIs
In Google Cloud Console, add these redirect URIs:

**For Production:**
- `https://your-backend-url.railway.app/api/auth/google/callback`

**For Development:**
- `http://localhost:5001/api/auth/google/callback`
- `http://localhost:5000/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback`

## Post-Deployment Setup

### 1. Verify Deployment
Check these endpoints to verify successful deployment:

```bash
# Backend Health Check
curl https://your-backend-url.railway.app/api/health

# Frontend
Visit https://your-frontend-url.railway.app
```

### 2. Test Authentication Flow
1. Visit the frontend URL
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you're redirected back successfully

### 3. Configure CORS
Ensure the backend's `FRONTEND_URL` environment variable matches your frontend's Railway URL exactly.

### 4. Enable Server Authentication (Optional)
If you want to allow processing without user login:

1. Run locally with production credentials:
```bash
cd backend
npm run get-tokens
```

2. Follow prompts to generate refresh token
3. Add `GOOGLE_REFRESH_TOKEN` to Railway environment variables
4. Redeploy the backend service

## Monitoring & Maintenance

### Railway Dashboard
- Monitor deployment status
- View logs in real-time
- Check resource usage
- Set up alerting

### Application Logs
Access logs through Railway dashboard or CLI:
```bash
railway logs --service=backend
railway logs --service=frontend
```

### Health Monitoring
- Backend health: `/api/health`
- Check authentication: `/api/auth/server-status`

## Troubleshooting

### Common Issues

#### 502 Bad Gateway Error
**Cause**: Application not responding on expected port
**Solution**: 
- Ensure `PORT` environment variable is set to 8080
- Check start command in Railway settings
- Review deployment logs for startup errors

#### CORS Errors
**Cause**: Frontend URL mismatch
**Solution**:
- Verify `FRONTEND_URL` in backend matches actual frontend URL
- Include protocol (https://) in the URL
- Don't include trailing slashes

#### Authentication Redirect Errors
**Cause**: Redirect URI mismatch
**Solution**:
- Add Railway backend URL to Google OAuth redirect URIs
- Format: `https://backend-url.railway.app/api/auth/google/callback`
- Wait 5 minutes for Google to propagate changes

#### Build Failures
**Frontend Build Failures**:
- Set `CI=false` to ignore ESLint warnings
- Check Node version compatibility

**Backend Build Failures**:
- Ensure all dependencies are in package.json
- Check TypeScript compilation errors

### Debugging Steps

1. **Check Deployment Logs**
   - Railway Dashboard > Service > Deployments > View logs

2. **Verify Environment Variables**
   - All required variables are set
   - No trailing spaces in values
   - Secrets are properly formatted

3. **Test Locally with Production Config**
   ```bash
   # Backend
   NODE_ENV=production npm start
   
   # Frontend
   REACT_APP_API_URL=https://prod-backend.railway.app npm start
   ```

4. **Check Network Configuration**
   - Railway public networking is enabled
   - Correct port configuration (8080 for Railway)
   - Health check path is accessible

## Rollback Procedure

If deployment fails:

1. **Via Railway Dashboard**:
   - Go to Deployments
   - Find last working deployment
   - Click "Rollback to this deployment"

2. **Via GitHub**:
   - Revert the problematic commit
   - Railway will auto-deploy the reversion

## Security Best Practices

1. **Never expose sensitive data**:
   - Don't log environment variables
   - Use Railway's secret management
   - Rotate credentials regularly

2. **HTTPS Only**:
   - Railway provides HTTPS by default
   - Never use HTTP in production

3. **Environment Isolation**:
   - Keep production and development credentials separate
   - Use different Google Cloud projects if possible

4. **Access Control**:
   - Limit Railway project access
   - Use team roles appropriately
   - Enable 2FA on all accounts

## Support & Resources

- [Railway Documentation](https://docs.railway.app)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Application Repository](https://github.com/your-org/google-sheets-permission-manager)

For deployment issues, check:
1. Railway deployment logs
2. Application health endpoints
3. Google Cloud Console for OAuth issues