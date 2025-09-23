import { Router } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { getServiceOAuth2Client } from '../services/googleService';

dotenv.config();

const router = Router();

// Construct redirect URI dynamically if not set
const getRedirectUri = () => {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  
  // In production, use the production URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://google-sheets-permission-manager-production.up.railway.app/api/auth/google/callback';
  }
  
  // In development, use localhost
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/api/auth/google/callback`;
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

const scopes = process.env.GOOGLE_SCOPES?.split(' ') || [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets'
];

router.get('/google', (req, res) => {
  console.log('OAuth request initiated');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('Redirect URI:', getRedirectUri());
  console.log('Scopes:', scopes);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  
  console.log('Generated auth URL:', authUrl);
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  
  console.log('OAuth callback received');
  console.log('Code:', code ? 'Present' : 'Not present');
  console.log('Error:', error || 'None');

  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${error}`);
  }

  if (!code || typeof code !== 'string') {
    // Check if this is from the get-tokens script
    if (req.headers['user-agent']?.includes('Mozilla')) {
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Authorization Code</h2>
            <p>Copy this code and paste it back in your terminal:</p>
            <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; font-family: monospace;">
              ${req.url.split('code=')[1]?.split('&')[0] || 'No code found'}
            </div>
          </body>
        </html>
      `);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=No authorization code provided`);
  }

  // Check if this is from the get-tokens script (show code on page)
  if (req.headers['user-agent']?.includes('Mozilla') && !req.headers.referer) {
    return res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Authorization Code Received!</h2>
          <p>Copy this code and paste it back in your terminal:</p>
          <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 14px; word-break: break-all;">
            ${code}
          </div>
          <p style="color: #666;">You can close this window after copying the code.</p>
        </body>
      </html>
    `);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // In production, you'd want to store these tokens securely
    // For now, we'll send them to the frontend
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/success`);
    redirectUrl.searchParams.append('access_token', tokens.access_token || '');
    redirectUrl.searchParams.append('refresh_token', tokens.refresh_token || '');
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Failed to authenticate`);
  }
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    oauth2Client.setCredentials({ refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    res.json({
      access_token: credentials.access_token,
      expires_in: credentials.expiry_date ? 
        Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});

// Verify authentication is working properly
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  const useServerAuth = req.query.server === 'true';
  
  let authMethod = 'none';
  let isValid = false;
  let accountInfo = null;
  let canAccessDrive = false;
  let testResults = [];

  try {
    let oauth2Client: any;
    
    if (useServerAuth && process.env.GOOGLE_REFRESH_TOKEN) {
      // Test server authentication
      authMethod = 'server';
      const serviceClient = getServiceOAuth2Client();
      if (!serviceClient) {
        throw new Error('Server authentication not initialized');
      }
      oauth2Client = serviceClient;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // Test user authentication
      authMethod = 'user';
      const accessToken = authHeader.split(' ')[1];
      oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials({ access_token: accessToken });
    } else {
      return res.status(401).json({
        authMethod,
        isValid: false,
        error: 'No authentication provided'
      });
    }

    // Test 1: Try to get account info
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      accountInfo = {
        email: data.email,
        name: data.name || data.email
      };
      testResults.push({ test: 'Get account info', status: 'success' });
    } catch (error: any) {
      testResults.push({ 
        test: 'Get account info', 
        status: 'failed',
        note: 'Token might not have email scope'
      });
    }

    // Test 2: Try to access Drive
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const fileList = await drive.files.list({
        pageSize: 1,
        fields: 'files(id)'
      });
      canAccessDrive = true;
      testResults.push({ test: 'Access Google Drive', status: 'success' });
    } catch (error: any) {
      testResults.push({ 
        test: 'Access Google Drive', 
        status: 'failed',
        error: error.message
      });
    }

    // Test 3: Try to access a public Google Sheet
    if (canAccessDrive) {
      try {
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const publicSheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Google Finance sample
        await drive.files.get({
          fileId: publicSheetId,
          fields: 'id, name'
        });
        testResults.push({ test: 'Access public sheet', status: 'success' });
      } catch (error: any) {
        testResults.push({ 
          test: 'Access public sheet', 
          status: 'failed',
          error: error.message
        });
      }
    }

    isValid = canAccessDrive;

    res.json({
      authMethod,
      isValid,
      accountInfo,
      canAccessDrive,
      testResults,
      recommendations: isValid ? [] : [
        'Regenerate authentication tokens',
        'Check OAuth client credentials',
        'Ensure all required scopes are granted'
      ]
    });

  } catch (error: any) {
    res.status(500).json({
      authMethod,
      isValid: false,
      error: error.message,
      testResults
    });
  }
});

// Check if server has refresh token or service account for public access
router.get('/server-status', async (req, res) => {
  const hasServerAuth = !!process.env.GOOGLE_REFRESH_TOKEN;
  let hasServiceAccount = false;
  let accountInfo = null;
  
  // Check for service account first
  try {
    const { getServiceAccountEmail } = await import('../services/googleServiceAccount');
    const email = getServiceAccountEmail();
    if (email) {
      hasServiceAccount = true;
      accountInfo = {
        email: email,
        name: 'Service Account'
      };
    }
  } catch (error) {
    // Service account not available
  }
  
  // Fall back to OAuth refresh token
  if (!hasServiceAccount && hasServerAuth) {
    try {
      // Use the existing service OAuth2 client
      const serviceClient = getServiceOAuth2Client();
      if (serviceClient) {
        const oauth2 = google.oauth2({ version: 'v2', auth: serviceClient });
        const { data } = await oauth2.userinfo.get();
        accountInfo = {
          email: data.email || '',
          name: data.name || data.email || 'Service Account'
        };
      }
    } catch (error: any) {
      // If we can't get account info, it might be due to missing scopes
      // This is not critical - authentication might still work for Drive access
      console.log('Could not fetch account info (might need to regenerate token with email scope)');
    }
  }
  
  const serverAuthenticated = hasServiceAccount || hasServerAuth;
  
  res.json({
    serverAuthenticated,
    authMode: serverAuthenticated ? 'server' : 'user',
    accountInfo,
    message: serverAuthenticated 
      ? `Server is authenticated${accountInfo ? ` as ${accountInfo.email}` : ''}. Users can process sheets without logging in.`
      : 'Server authentication not configured. Users must log in with Google.'
  });
});

export default router;