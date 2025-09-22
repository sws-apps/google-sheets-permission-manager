import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

let driveService: any = null;
let serviceAccountEmail: string = '';

export const initializeServiceAccount = async (): Promise<void> => {
  try {
    // Path to service account key file
    const keyPath = path.join(__dirname, '../../service-account.json');
    
    if (!fs.existsSync(keyPath)) {
      console.warn('No service account key file found at:', keyPath);
      console.warn('Download it from Google Cloud Console and save as service-account.json');
      return;
    }

    // Read the service account key
    const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    serviceAccountEmail = keyFile.client_email;

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    const authClient = await auth.getClient();
    
    // Initialize services
    driveService = google.drive({ version: 'v3', auth: authClient as any });
    
    console.log('✅ Service account initialized successfully');
    console.log(`📧 Service account email: ${serviceAccountEmail}`);
    console.log('\n⚠️  IMPORTANT: Share your Google Sheets with this email to grant access!');
  } catch (error) {
    console.error('Failed to initialize service account:', error);
  }
};

export const getServiceDriveClient = () => {
  if (!driveService) {
    throw new Error('Service account not initialized. Add service-account.json file.');
  }
  return driveService;
};

export const getServiceAccountEmail = () => serviceAccountEmail;