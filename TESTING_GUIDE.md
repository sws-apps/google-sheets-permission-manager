# Testing Guide for Google Sheets Permission Manager

## Prerequisites
Make sure both servers are running (check the Terminal windows that were opened).

## Testing Steps

### 1. Open the Application
- Open your web browser
- Go to: http://localhost:3000

### 2. Check Server Authentication Status
You should see an info banner at the top saying:
"Server authentication is enabled. You can process sheets without logging in!"

This means you can use the tool WITHOUT logging in because it's using the refresh token from your .env file.

### 3. Test File Upload
1. You should see "Upload Spreadsheet" as the first step (no login required!)
2. Click or drag the test CSV file I created: `test-sheets.csv`
3. The tool should extract and display the Google Sheets URLs found in the file

### 4. Process the Sheets
1. Click "Start Processing"
2. The tool will:
   - Copy each Google Sheet
   - Set the copy to view-only access
   - Display results in a table

### 5. Check Results
- ✅ Success entries show the new copied sheet URL
- ❌ Error entries show why they failed (e.g., invalid URL, no access)
- Click the copy button to copy new URLs
- Click "Export Results" to download a CSV report

## Alternative: Test with User Authentication

If you want to test user authentication instead:

1. Click "Sign in with Google" 
2. Log in with your Google account
3. Grant permissions
4. Follow steps 3-5 above

## Troubleshooting

### If servers aren't running:
1. Backend: `cd backend && npm run dev`
2. Frontend: `cd frontend && npm start`

### If you get authentication errors:
- Make sure the Google OAuth credentials in .env are correct
- For server auth, the refresh token must be valid

### If file upload doesn't work:
- Make sure the file contains valid Google Sheets URLs
- URLs should look like: https://docs.google.com/spreadsheets/d/[ID]/...

## Sample Google Sheets URLs for Testing

If you need real sheets to test with, create some test sheets in your Google Drive and use their URLs.