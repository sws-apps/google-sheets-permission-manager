import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

let serviceOAuth2Client: OAuth2Client | null = null;
let driveService: any = null;

export const initializeServiceAccount = async (): Promise<void> => {
  try {
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.warn('No refresh token found. Server-side authentication not available.');
      return;
    }

    // Create OAuth2 client for service account
    serviceOAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials with refresh token
    serviceOAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Force refresh the access token
    const { credentials } = await serviceOAuth2Client.refreshAccessToken();
    serviceOAuth2Client.setCredentials(credentials);

    driveService = google.drive({ version: 'v3', auth: serviceOAuth2Client });
    
    console.log('Google Drive service initialized successfully with refresh token');
  } catch (error) {
    console.error('Failed to initialize Google Drive service:', error);
    throw error;
  }
};

export const getServiceDriveClient = () => {
  if (!driveService) {
    throw new Error('Drive service not initialized. Run getTokens.ts to set up refresh token.');
  }
  return driveService;
};

export const getUserDriveClient = (accessToken: string, refreshToken?: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
};

export const getServiceOAuth2Client = () => {
  return serviceOAuth2Client;
};