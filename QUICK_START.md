# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- Google Cloud account with Sheets API enabled
- Service account JSON key file

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/josephkerolos/google-sheets-permission-manager.git
cd google-sheets-permission-manager
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Add your Google service account credentials
# Place your service-account.json in backend/ directory
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create a service account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create new service account
   - Download JSON key as `service-account.json`
   - Place in `backend/` directory

5. Share your Google Sheets with the service account email

## Features
- Read Google Sheets data
- Process templates
- Batch processing
- Export to CSV/Excel formats

## Environment Variables
Create `backend/.env`:
```
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
PORT=5001
```

## Support
For issues or questions, open an issue on GitHub.