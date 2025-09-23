import { Router } from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getServiceDriveClient, getUserDriveClient } from '../services/googleService';
import { getServiceDriveClient as getServiceAccountDrive } from '../services/googleServiceAccount';

const router = Router();

interface ProcessRequest {
  links: string[];
  accessToken?: string;
  refreshToken?: string;
  useServerAuth?: boolean;
}

interface ProcessResult {
  originalUrl: string;
  newUrl?: string;
  status: 'success' | 'error';
  error?: string;
}

router.post('/sheets', async (req, res) => {
  const { links, accessToken, refreshToken, useServerAuth } = req.body as ProcessRequest;

  if (!links || !Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: 'No links provided' });
  }

  let drive: any;

  try {
    // Check authentication methods in order of preference
    if (useServerAuth && process.env.GOOGLE_REFRESH_TOKEN) {
      // Use OAuth refresh token (server authentication)
      drive = getServiceDriveClient();
      console.log('Using OAuth refresh token (server auth)');
    } else if (accessToken) {
      // Use user authentication
      drive = getUserDriveClient(accessToken, refreshToken);
      console.log('Using user authentication');
    } else {
      // Try service account as last resort (if configured)
      try {
        drive = getServiceAccountDrive();
        console.log('Using service account authentication');
      } catch (serviceError) {
        return res.status(401).json({ 
          error: 'Authentication required. Please sign in with Google or configure server authentication.' 
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Failed to authenticate. Please check your credentials.' 
    });
  }

  const results: ProcessResult[] = [];

  for (const link of links) {
    try {
      const fileId = extractFileId(link);
      if (!fileId) {
        results.push({
          originalUrl: link,
          status: 'error',
          error: 'Invalid Google Sheets URL'
        });
        continue;
      }

      // Get original file information
      const fileInfo = await drive.files.get({
        fileId,
        fields: 'name, mimeType'
      });

      if (fileInfo.data.mimeType !== 'application/vnd.google-apps.spreadsheet') {
        results.push({
          originalUrl: link,
          status: 'error',
          error: 'URL is not a Google Sheets document'
        });
        continue;
      }

      // Copy the file
      const copyResponse = await drive.files.copy({
        fileId,
        requestBody: {
          name: `${fileInfo.data.name} - Copy (View Only)`
        }
      });

      const newFileId = copyResponse.data.id;
      if (!newFileId) {
        throw new Error('Failed to get new file ID');
      }

      // Update permissions to viewer only
      // First, remove any existing permissions (except owner)
      const permissions = await drive.permissions.list({
        fileId: newFileId,
        fields: 'permissions(id, role, type)'
      });

      // Remove non-owner permissions
      for (const permission of permissions.data.permissions || []) {
        if (permission.role !== 'owner' && permission.id) {
          await drive.permissions.delete({
            fileId: newFileId,
            permissionId: permission.id
          });
        }
      }

      // Add viewer permission for anyone with link
      await drive.permissions.create({
        fileId: newFileId,
        requestBody: {
          type: 'anyone',
          role: 'reader'
        }
      });

      const newUrl = `https://docs.google.com/spreadsheets/d/${newFileId}`;
      
      results.push({
        originalUrl: link,
        newUrl,
        status: 'success'
      });

    } catch (error: any) {
      console.error(`Error processing ${link}:`, error);
      
      // Provide more detailed error messages
      let errorMessage = 'Unknown error occurred';
      if (error.code === 404 || error.status === 404) {
        errorMessage = 'File not found or no access. Make sure the file exists and is shared with the authenticated Google account.';
      } else if (error.code === 403) {
        errorMessage = 'Access denied. The authenticated account does not have permission to access this file.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      results.push({
        originalUrl: link,
        status: 'error',
        error: errorMessage
      });
    }
  }

  res.json({
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length
    },
    authMode: useServerAuth ? 'server' : 'user'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  const hasServerAuth = !!process.env.GOOGLE_REFRESH_TOKEN;
  res.json({
    status: 'OK',
    serverAuthAvailable: hasServerAuth
  });
});

function extractFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export default router;