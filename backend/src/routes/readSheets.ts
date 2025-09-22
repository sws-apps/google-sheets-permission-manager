import { Router } from 'express';
import { google } from 'googleapis';
import { getServiceDriveClient as getServiceAccountDrive } from '../services/googleServiceAccount';
import { getServiceDriveClient, getUserDriveClient } from '../services/googleService';

const router = Router();

interface ReadRequest {
  links: string[];
  ranges?: string[]; // e.g., ['A1:B10', 'Sheet2!C1:D5']
  accessToken?: string;
  refreshToken?: string;
  useServerAuth?: boolean;
}

interface SheetData {
  originalUrl: string;
  sheetId: string;
  sheetName?: string;
  status: 'success' | 'error';
  error?: string;
  data?: {
    range: string;
    values: any[][];
  }[];
}

router.post('/read-sheets', async (req, res) => {
  const { links, ranges = ['A1:Z100'], accessToken, refreshToken, useServerAuth } = req.body as ReadRequest;

  if (!links || !Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: 'No links provided' });
  }

  let auth: any;

  try {
    // Try service account first
    try {
      const drive = getServiceAccountDrive();
      // Get the auth client from the service
      const { google: googleapis } = await import('googleapis');
      auth = (drive as any).context._options.auth;
      console.log('Using service account authentication for Sheets API');
    } catch (serviceError) {
      // Fall back to other auth methods
      if (useServerAuth && process.env.GOOGLE_REFRESH_TOKEN) {
        const { getServiceOAuth2Client } = await import('../services/googleService');
        auth = getServiceOAuth2Client();
        console.log('Using OAuth refresh token for Sheets API');
      } else if (accessToken) {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        auth = oauth2Client;
        console.log('Using user authentication for Sheets API');
      } else {
        return res.status(401).json({ 
          error: 'No authentication configured. Please set up service account or OAuth.' 
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Failed to authenticate. Please check your credentials.' 
    });
  }

  // Initialize Sheets API
  const sheets = google.sheets({ version: 'v4', auth });
  const results: SheetData[] = [];

  for (const link of links) {
    try {
      const spreadsheetId = extractSpreadsheetId(link);
      if (!spreadsheetId) {
        results.push({
          originalUrl: link,
          sheetId: '',
          status: 'error',
          error: 'Invalid Google Sheets URL'
        });
        continue;
      }

      // Get spreadsheet metadata
      let sheetName = 'Unknown';
      try {
        const metadata = await sheets.spreadsheets.get({
          spreadsheetId,
          fields: 'properties.title'
        });
        sheetName = metadata.data.properties?.title || 'Unknown';
      } catch (metaError) {
        console.log('Could not fetch sheet metadata');
      }

      // Read data from specified ranges
      const data: { range: string; values: any[][] }[] = [];
      
      for (const range of ranges) {
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
          });

          data.push({
            range: response.data.range || range,
            values: response.data.values || []
          });
        } catch (rangeError: any) {
          console.error(`Error reading range ${range}:`, rangeError.message);
          // Continue with other ranges even if one fails
        }
      }

      results.push({
        originalUrl: link,
        sheetId: spreadsheetId,
        sheetName,
        status: 'success',
        data
      });

    } catch (error: any) {
      console.error(`Error processing ${link}:`, error);
      
      let errorMessage = error.message || 'Unknown error occurred';
      
      // Provide helpful error messages
      if (error.code === 403) {
        errorMessage = 'Access denied. Make sure the sheet is shared with the service account: sheets-manager@sheet-automation-ppp-naics.iam.gserviceaccount.com';
      } else if (error.code === 404) {
        errorMessage = 'Sheet not found. Check if the URL is correct and the sheet still exists.';
      }
      
      results.push({
        originalUrl: link,
        sheetId: extractSpreadsheetId(link) || '',
        status: 'error',
        error: errorMessage
      });
    }
  }

  res.json({ results });
});

// Also provide an endpoint to read specific cells
router.post('/read-cells', async (req, res) => {
  const { spreadsheetId, cells, accessToken, refreshToken, useServerAuth } = req.body;

  if (!spreadsheetId || !cells || !Array.isArray(cells)) {
    return res.status(400).json({ error: 'spreadsheetId and cells array are required' });
  }

  let auth: any;

  try {
    // Authentication logic (same as above)
    try {
      const drive = getServiceAccountDrive();
      const { google: googleapis } = await import('googleapis');
      auth = (drive as any).context._options.auth;
    } catch (serviceError) {
      if (useServerAuth && process.env.GOOGLE_REFRESH_TOKEN) {
        const { getServiceOAuth2Client } = await import('../services/googleService');
        auth = getServiceOAuth2Client();
      } else if (accessToken) {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        auth = oauth2Client;
      } else {
        return res.status(401).json({ 
          error: 'No authentication configured.' 
        });
      }
    }
  } catch (error) {
    return res.status(401).json({ 
      error: 'Failed to authenticate.' 
    });
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const cellData: { [cell: string]: any } = {};

  try {
    // Convert cells like ['A1', 'B2'] to ranges for batch get
    const ranges = cells.map(cell => `${cell}:${cell}`);
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges
    });

    // Map the values back to cell references
    cells.forEach((cell, index) => {
      const valueRange = response.data.valueRanges?.[index];
      cellData[cell] = valueRange?.values?.[0]?.[0] || null;
    });

    res.json({ 
      spreadsheetId,
      cellData 
    });

  } catch (error: any) {
    res.status(500).json({ 
      error: error.message || 'Failed to read cells' 
    });
  }
});

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export default router;