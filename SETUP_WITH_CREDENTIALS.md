# Setup Instructions (Private Repository)

## For Collaborators

Since this is a private repository with credentials included, setup is simplified for authorized collaborators.

### Prerequisites
- Node.js 16+ installed
- Access to this private repository (granted by owner)

### Quick Setup

1. **Clone the repository:**
```bash
git clone https://github.com/josephkerolos/google-sheets-permission-manager.git
cd google-sheets-permission-manager
```

2. **Install Backend Dependencies:**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

4. **Run the Application:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Opens at http://localhost:3000
```

## Important Notes

### Credentials Already Included
- The `.env` file in `/backend` contains Google Cloud OAuth credentials
- The `service-account.json` file contains service account credentials
- These files are in `.gitignore` and stored locally only

### Service Account Email
The service account email that has access to sheets:
```
sheets-manager@sheet-automation-ppp-naics.iam.gserviceaccount.com
```

**IMPORTANT:** Any Google Sheets you want to process must be shared with this email address!

### Security
- NEVER commit credentials to any public repository
- Keep this repository private
- Only share access with trusted collaborators

### Adding Collaborators
To give someone access to this repository:
1. Go to Settings → Manage access
2. Click "Add people"
3. Enter their GitHub username
4. Select appropriate permission level

## Troubleshooting

If you encounter authentication issues:
1. Ensure the Google Sheets are shared with the service account email
2. Check that the `.env` file exists in `/backend`
3. Verify `service-account.json` exists in `/backend`

## Features Available
- Read and process Google Sheets
- Template extraction
- Batch processing
- Export to CSV/Excel formats
- Portal template mapping