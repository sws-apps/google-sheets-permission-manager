#!/bin/bash

# Railway Deployment Script for Google Sheets Permission Manager
# This script helps automate the Railway deployment process

echo "🚀 Railway Deployment Script"
echo "============================"
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null && ! command -v /Users/kmh/.npm-global/bin/railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Set Railway CLI path
RAILWAY="/Users/kmh/.npm-global/bin/railway"
if ! command -v railway &> /dev/null; then
    RAILWAY="railway"
fi

echo "📝 Step 1: Login to Railway"
echo "----------------------------"
echo "Please login to Railway when the browser opens..."
$RAILWAY login

echo ""
echo "📦 Step 2: Create New Project"
echo "-----------------------------"
$RAILWAY init

echo ""
echo "🔧 Step 3: Deploy Backend Service"
echo "---------------------------------"
cd backend

# Create railway.toml for backend
cat > railway.toml << 'EOF'
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
EOF

echo "Deploying backend..."
$RAILWAY up --service backend

# Get backend URL
BACKEND_URL=$($RAILWAY status --json | grep -o '"url":"[^"]*' | sed 's/"url":"//')
echo "✅ Backend deployed at: $BACKEND_URL"

cd ..

echo ""
echo "🎨 Step 4: Deploy Frontend Service"
echo "----------------------------------"
cd frontend

# Create railway.toml for frontend
cat > railway.toml << 'EOF'
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npx serve -s build -l $PORT"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
EOF

echo "Deploying frontend..."
$RAILWAY up --service frontend

# Get frontend URL
FRONTEND_URL=$($RAILWAY status --json | grep -o '"url":"[^"]*' | sed 's/"url":"//')
echo "✅ Frontend deployed at: $FRONTEND_URL"

cd ..

echo ""
echo "⚙️ Step 5: Configure Environment Variables"
echo "----------------------------------------"
echo "Setting environment variables for backend..."

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Set backend environment variables
$RAILWAY variables set NODE_ENV=production --service backend
$RAILWAY variables set SESSION_SECRET="$SESSION_SECRET" --service backend
$RAILWAY variables set FRONTEND_URL="https://$FRONTEND_URL" --service backend
$RAILWAY variables set GOOGLE_REDIRECT_URI="https://$BACKEND_URL/api/auth/google/callback" --service backend
$RAILWAY variables set GOOGLE_SCOPES="https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets" --service backend

echo ""
echo "⚠️ You need to manually set these Google OAuth variables for the backend:"
echo "  GOOGLE_CLIENT_ID=<your_client_id>"
echo "  GOOGLE_CLIENT_SECRET=<your_client_secret>"
echo ""
echo "Run these commands:"
echo "  $RAILWAY variables set GOOGLE_CLIENT_ID=<your_id> --service backend"
echo "  $RAILWAY variables set GOOGLE_CLIENT_SECRET=<your_secret> --service backend"

# Set frontend environment variables
echo ""
echo "Setting environment variables for frontend..."
$RAILWAY variables set NODE_ENV=production --service frontend
$RAILWAY variables set REACT_APP_API_URL="https://$BACKEND_URL" --service frontend

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📋 Deployment Summary:"
echo "Backend URL: https://$BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"
echo ""
echo "📝 Next Steps:"
echo "1. Set your Google OAuth credentials (see above)"
echo "2. Update Google Cloud Console with redirect URI:"
echo "   https://$BACKEND_URL/api/auth/google/callback"
echo "3. Redeploy services after setting variables:"
echo "   $RAILWAY up --service backend"
echo "   $RAILWAY up --service frontend"
echo ""
echo "🔍 To view logs:"
echo "  $RAILWAY logs --service backend"
echo "  $RAILWAY logs --service frontend"
echo ""
echo "✨ Your app will be available at: https://$FRONTEND_URL"