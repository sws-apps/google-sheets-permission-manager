# Google Sheets Permission Manager

A web application that bulk processes Google Sheets URLs from CSV/XLSX files, automatically creates copies, and sets them to view-only access.

## Features

- **Dual Authentication Modes**: User authentication OR server-side authentication
- **Full Google Drive Access**: Access any Google Sheets in your Drive (not limited to specific folders)
- Upload CSV/XLSX files containing Google Sheets URLs
- Automatic extraction of all Google Sheets links from uploaded files
- Bulk copy Google Sheets with a single click
- Set all copied sheets to view-only (reader) access
- Real-time progress tracking
- Export results as CSV
- Clean, intuitive Material-UI interface

## Authentication Modes

### 1. User Authentication (Default)
Each user logs in with their own Google account to process their sheets.

### 2. Server Authentication (Optional)
Configure the server with a Google account's refresh token to allow anyone to process sheets without logging in. This uses YOUR Google Drive access.

## Prerequisites

1. Node.js (v14 or higher)
2. npm or yarn
3. Google Cloud Console account
4. Google APIs enabled (Drive API)

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback` (default)
     - `http://localhost:5000/api/auth/google/callback` (alternative port)
     - `http://localhost:3000/api/auth/google/callback` (if needed)
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

### User Authentication Mode
1. Open http://localhost:3000
2. Click "Sign in with Google" and authorize
3. Upload a CSV/Excel file with Google Sheets URLs
4. Process the sheets

### Server Authentication Mode (if configured)
1. Open http://localhost:3000
2. Upload a CSV/Excel file with Google Sheets URLs
3. Process the sheets (no login required!)

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

## Security Considerations

### Server Authentication Security
- The refresh token gives FULL access to your Google Drive
- Only use this mode if you trust all users of your application
- Consider creating a dedicated Google account for this purpose
- Never expose the refresh token publicly
- Use HTTPS in production

### General Security
- Never commit your `.env` file
- Implement rate limiting for API endpoints
- Use secure session storage in production
- Regularly rotate API keys

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

- `GET /api/auth/server-status` - Check if server authentication is configured
- `GET /api/auth/verify?server=true` - Verify authentication is working properly
- `POST /api/process/sheets` - Process Google Sheets (supports both auth modes)
- `POST /api/upload/file` - Upload and parse CSV/XLSX files

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

## License

MIT