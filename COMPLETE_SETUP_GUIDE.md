# 📋 Complete Google Sheets Permission Manager Setup Guide

## Overview
This tool uses **Google Drive API** for file operations (copy, permissions) and can use **Google Sheets API** for reading cell data. The Drive API alone is sufficient for the current functionality.

## 🔧 Step 1: Fix the Current Redirect URI Error

### 1.1 Get Your Redirect URI
```bash
cd backend
npm run show-redirect-uri
```
Copy the exact URI shown: `http://localhost:5001/api/auth/google/callback`

### 1.2 Add to Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Find OAuth client: `857415650385-1ac7v883bfls6dg3k4esg44hrs9mtfm6.apps.googleusercontent.com`
5. Click to edit
6. Under "Authorized redirect URIs", add:
   - `http://localhost:5001/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (backup)
7. Click "Save"

## 🔑 Step 2: Set Up Server Authentication

### 2.1 Generate Refresh Token
```bash
cd backend
npm run get-tokens
```

1. Click the generated URL
2. Sign in with the Google account that has access to your sheets
3. Grant all permissions
4. Copy the authorization code from the redirect URL
5. Paste it back in terminal
6. Copy the `GOOGLE_REFRESH_TOKEN` value
7. Add it to your `.env` file

### 2.2 Verify Setup
```bash
# Check OAuth configuration
npm run verify-oauth

# Test authentication
npm run test-auth
```

## 🚀 Step 3: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## 📊 Step 4: Using the Application

### With Server Authentication (Recommended)
1. No login required!
2. Upload a CSV/XLSX file with Google Sheets URLs
3. Click "Process Sheets"
4. Download results

### With User Authentication
1. Click "Sign in with Google"
2. Authorize the app
3. Upload and process sheets

## 🔄 API Scopes Explained

### Current Scope (Drive API)
```
https://www.googleapis.com/auth/drive
```
- ✅ List files
- ✅ Copy sheets
- ✅ Change permissions
- ✅ Create new files
- ❌ Read/write cell data

### For Cell Operations (Add Sheets API)
```
https://www.googleapis.com/auth/spreadsheets
```
- ✅ Read cell values
- ✅ Write cell values
- ✅ Format cells
- ✅ Create charts

## 📝 Example: Reading Cell Data

If you want to read specific cells from sheets, here's how:

### 1. Enable Sheets API
- Go to Google Cloud Console
- APIs & Services → Library
- Search for "Google Sheets API"
- Click "Enable"

### 2. Update Scopes in `.env`
```env
GOOGLE_SCOPES=https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets
```

### 3. Use the Sheets Service
```typescript
import { SheetsService } from './services/sheetsService';

// Read specific cells
const sheets = new SheetsService(oauth2Client);
const cellData = await sheets.readSpecificCells(
  '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  ['A1', 'B2', 'C3']
);
console.log(cellData); // { A1: 'Hello', B2: 'World', C3: 42 }

// Read a range
const rangeData = await sheets.readRange(
  '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  'Sheet1!A1:D10'
);
console.log(rangeData.values); // 2D array of values
```

## 🔍 Troubleshooting

### "File not found" Error
- The sheet isn't shared with your server account
- Run `npm run test-auth` to see which account is being used
- Share the sheet with that email address

### "Invalid grant" Error
- Your refresh token is expired
- Run `npm run get-tokens` again
- Update the `.env` file

### Can't Access Private Sheets
1. Find which account is authenticated:
   ```bash
   npm run test-auth
   ```
2. Share your sheets with that email
3. Or use user authentication instead

## 📚 Common Use Cases

### 1. Bulk Copy Public Sheets
- Use the included `test-public-sheets.csv`
- No authentication issues!

### 2. Process Company Sheets
- Set up server auth with a company Google account
- Share all sheets with that account
- Anyone can use the tool without logging in

### 3. Individual User Sheets
- Don't set up server auth
- Each user logs in with their own account
- They can only process their own sheets

## 🛠️ Next Steps

1. **For Basic Operations**: You're all set! The current setup handles copying and permissions.

2. **For Cell Operations**: 
   - Enable Google Sheets API
   - Update scopes in `.env`
   - Regenerate tokens with new scopes
   - Use the `SheetsService` class

3. **For Production**:
   - Use HTTPS
   - Set up proper domain
   - Use environment variables for production
   - Consider using a service account instead of OAuth

## 📞 Need Help?

Run these diagnostic commands:
```bash
npm run show-redirect-uri  # Shows exact redirect URI
npm run verify-oauth       # Checks OAuth setup
npm run test-auth         # Tests authentication
curl http://localhost:5001/api/auth/verify?server=true  # Test API
```