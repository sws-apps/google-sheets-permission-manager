import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

// List Google Sheets from user's Drive
router.get('/files', async (req, res) => {
  const { accessToken, pageToken, searchQuery } = req.query;

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken as string });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Build query to filter only Google Sheets
    let query = "mimeType='application/vnd.google-apps.spreadsheet'";
    if (searchQuery) {
      query += ` and name contains '${searchQuery}'`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, modifiedTime, owners, shared, webViewLink, iconLink)',
      pageSize: 20,
      pageToken: pageToken as string,
      orderBy: 'modifiedTime desc'
    });

    res.json({
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken
    });
  } catch (error: any) {
    console.error('Error listing Drive files:', error);
    res.status(500).json({ 
      error: 'Failed to list files', 
      details: error.message 
    });
  }
});

// Get specific file details
router.get('/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { accessToken } = req.query;

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken as string });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, modifiedTime, size, owners, shared, permissions, webViewLink'
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Error getting file details:', error);
    res.status(500).json({ 
      error: 'Failed to get file details', 
      details: error.message 
    });
  }
});

export default router;