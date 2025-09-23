# Google Sheets Permission Manager

A comprehensive web application with two main features:
1. **Single Sheet Processor**: Bulk process Google Sheets URLs to create view-only copies
2. **ERC Template Processor**: Extract and transform Employee Retention Credit data from Excel templates

## Features

### Single Sheet Processor
- **Dual Authentication Modes**: User authentication OR server-side authentication
- **Full Google Drive Access**: Access any Google Sheets in your Drive
- Upload CSV/XLSX files containing Google Sheets URLs
- Bulk copy Google Sheets and set to view-only access
- Real-time progress tracking
- Export results as CSV

### ERC Template Processor
- Extract data from Excel templates or Google Sheets URLs
- Transform ERC data into organized structure
- Export to multiple formats (Portal, Bulk Upload, CSV, Excel)
- Validate data completeness and accuracy
- Support for flexible template formats

## Authentication Modes

### 1. User Authentication (Default)
Each user logs in with their own Google account to process their sheets.

### 2. Server Authentication (Optional)
Configure the server with a Google account's refresh token to allow anyone to process sheets without logging in. This uses YOUR Google Drive access.

## Live Deployment

🚀 **The application is deployed and available at:**
- Frontend: `https://frontend-production-54d6.up.railway.app`
- Backend API: `https://google-sheets-permission-manager-production.up.railway.app`

## Prerequisites

1. Node.js (v14 or higher)
2. npm or yarn
3. Google Cloud Console account
4. Google APIs enabled (Drive API)

## Setup Instructions

## Deployment Guide

### Railway Deployment

The application is deployed on Railway with the following configuration:

#### Backend Deployment
1. **Environment Variables Required**:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=random_session_secret
   FRONTEND_URL=your_frontend_railway_url
   NODE_ENV=production
   PORT=8080
   GOOGLE_REFRESH_TOKEN=optional_for_server_auth
   ```

2. **Railway Settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
   - Port: 8080

#### Frontend Deployment
1. **Environment Variables Required**:
   ```
   REACT_APP_API_URL=your_backend_railway_url
   CI=false
   ```

2. **Railway Settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l $PORT`
   - Port: Automatically assigned by Railway

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For Local Development:
       - `http://localhost:5001/api/auth/google/callback`
       - `http://localhost:5000/api/auth/google/callback`
       - `http://localhost:3000/api/auth/google/callback`
     - For Production (Railway):
       - `https://google-sheets-permission-manager-production.up.railway.app/api/auth/google/callback`
       - Add your custom domain callbacks if applicable
   - Save the Client ID and Client Secret

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=generate_a_random_string_here
FRONTEND_URL=http://localhost:3000
PORT=5001
```

Install dependencies and start the server:
```bash
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. (Optional) Enable Server Authentication

To allow users to process sheets without logging in (using YOUR Google Drive):

```bash
cd backend
npm run get-tokens
```

Follow the prompts to:
1. Open the provided URL in your browser
2. Log in with the Google account that has access to the sheets
3. Grant all permissions
4. Copy the authorization code and paste it back
5. Add the generated tokens to your `.env` file:

```
GOOGLE_REFRESH_TOKEN=1//0gLtG...
```

Restart the server, and users can now process sheets without logging in!

## Usage

### Production Usage
1. Visit `https://frontend-production-54d6.up.railway.app`
2. Choose between:
   - **Single Sheet Processor**: Process Google Sheets URLs
   - **ERC Template Processor**: Process ERC templates

### Local Development
1. Open http://localhost:3000
2. For Single Sheet Processor:
   - Sign in with Google (if user auth)
   - Upload CSV/Excel with Google Sheets URLs
   - Process the sheets
3. For ERC Template Processor:
   - Upload Excel template or enter Google Sheets URL
   - View extracted data
   - Export in desired format

## File Format

Your CSV/XLSX file can contain Google Sheets URLs in any cell. The tool will automatically extract all valid URLs that match these patterns:
- `https://docs.google.com/spreadsheets/d/[ID]/...`
- `https://sheets.google.com/...`

## File Access Requirements

### When Using Server Authentication
When server authentication is enabled, the tool uses the Google account associated with the refresh token. This means:

1. **Only accessible files can be processed**: The Google Sheets must be:
   - Owned by the server's Google account
   - Shared with the server's Google account
   - Publicly accessible (anyone with link)

2. **Common errors**:
   - "File not found or no access" - The sheet doesn't exist or isn't shared with the server account
   - "Access denied" - The server account doesn't have permission to copy the sheet

3. **Best practices**:
   - Share sheets with the server account before processing
   - Use the displayed email address to know which account to share with
   - Test with public Google Sheets first

### When Using User Authentication
Each user processes sheets using their own Google account, so they can access any sheets they have permission to view.

## Environment Variables Reference

### Backend Environment Variables
```bash
# Google OAuth Configuration (Required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Configuration (Required)
SESSION_SECRET=random_string_for_session_encryption

# Server Configuration
PORT=5001                    # Port for backend server
NODE_ENV=development         # or 'production'
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS

# Optional - For Server Authentication
GOOGLE_REFRESH_TOKEN=token_for_server_auth
```

### Frontend Environment Variables
```bash
# Backend API URL (Required for production)
REACT_APP_API_URL=http://localhost:5001  # Backend API URL

# For Railway deployment
CI=false  # Prevents build failures due to warnings
```

## Security Considerations

### Authentication Security
- OAuth tokens are stored securely in server sessions
- Refresh tokens (if used) should be kept confidential
- Always use HTTPS in production
- Implement proper CORS configuration

### Best Practices
- Never commit `.env` files to version control
- Use environment-specific configurations
- Regularly rotate API keys and secrets
- Monitor API usage and implement rate limiting
- Use dedicated service accounts for production

## Development

### Backend (Express + TypeScript)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run get-tokens` - Generate refresh token for server auth

### Frontend (React + TypeScript)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## API Endpoints

### Authentication
- `GET /api/auth/server-status` - Check if server authentication is configured
- `GET /api/auth/verify` - Verify authentication status
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user

### Single Sheet Processing
- `POST /api/process/sheets` - Process Google Sheets URLs
- `POST /api/upload/file` - Upload and parse CSV/XLSX files
- `GET /api/health` - Health check endpoint

### ERC Template Processing
- `POST /api/template/extract` - Extract data from uploaded Excel
- `POST /api/template/extract-from-sheets` - Extract from Google Sheets URL
- `POST /api/template/transform` - Transform extracted data
- `POST /api/template/export/:format` - Export data (json/csv/xlsx)
- `POST /api/template/export/portal` - Export to portal format
- `POST /api/template/export/bulk-upload` - Export to bulk upload format
- `GET /api/template/sample-data` - Get sample ERC data

## Troubleshooting

### "redirect_uri_mismatch" Error

If you see `Error 400: redirect_uri_mismatch` when trying to authenticate:

1. **Run the diagnostic script**:
   ```bash
   cd backend
   npm run show-redirect-uri
   ```
   This will show you the EXACT redirect URI to add to Google Cloud Console.

2. **Add the redirect URI to Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to "APIs & Services" → "Credentials"
   - Click on your OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", add the URI shown by the script
   - Click "Save"

3. **Common issues**:
   - **Port mismatch**: Make sure the port in Google Console matches your .env file
   - **Trailing slashes**: Don't add trailing slashes to the URI
   - **http vs https**: Use `http` for localhost, not `https`
   - **Multiple Google accounts**: Make sure you're editing the correct project

4. **Recommended redirect URIs to add**:
   ```
   http://localhost:5001/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```

### "File not found or no access" Error

If you're getting this error immediately when trying to process sheets:

1. **Verify authentication is working**:
   ```bash
   cd backend
   npm run test-auth
   ```

2. **Check which account is being used**:
   - The test script will show which files the server account can access
   - If you can't see the account email, regenerate the token with email scope

3. **Common causes**:
   - The sheet isn't shared with the server's Google account
   - The refresh token is expired or invalid
   - The OAuth client credentials have changed

4. **Solution**:
   If authentication is broken, regenerate the refresh token:
   ```bash
   cd backend
   npm run get-tokens
   ```
   Then update your `.env` file with the new `GOOGLE_REFRESH_TOKEN`.

### Testing with Public Sheets

Use the included `test-public-sheets.csv` which contains publicly accessible Google Sheets that should work without any sharing requirements.

## Project Structure

```
google-sheets-permission-manager/
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT