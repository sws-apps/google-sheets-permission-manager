import { Router } from 'express';
import { google } from 'googleapis';
import { getServiceDriveClient as getServiceAccountDrive } from '../services/googleServiceAccount';
import { getServiceDriveClient, getUserDriveClient } from '../services/googleService';

const router = Router();

interface ProcessRequest {
  links: string[];
  accessToken?: string;
  refreshToken?: string;
  useServerAuth?: boolean;
  mode?: 'copy' | 'permissions-only'; // New option
}

interface ProcessResult {
  originalUrl: string;
  newUrl?: string;
  status: 'success' | 'error';
  error?: string;
  mode?: string;
}

router.post('/sheets-no-copy', async (req, res) => {
  const { links, accessToken, refreshToken, useServerAuth, mode = 'permissions-only' } = req.body as ProcessRequest;

  if (!links || !Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: 'No links provided' });
  }

  let drive: any;

  try {
    // Try service account first (easiest!)
    try {
      drive = getServiceAccountDrive();
      console.log('Using service account authentication');
    } catch (serviceError) {
      // Fall back to other auth methods
      if (useServerAuth && process.env.GOOGLE_REFRESH_TOKEN) {
        drive = getServiceDriveClient();
        console.log('Using OAuth refresh token');
      } else if (accessToken) {
        drive = getUserDriveClient(accessToken, refreshToken);
        console.log('Using user authentication');
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
        fields: 'name, mimeType, permissions, webViewLink'
      });

      if (fileInfo.data.mimeType !== 'application/vnd.google-apps.spreadsheet') {
        results.push({
          originalUrl: link,
          status: 'error',
          error: 'URL is not a Google Sheets document'
        });
        continue;
      }

      // For permissions-only mode: just update the sharing settings
      if (mode === 'permissions-only') {
        try {
          // Check if already has public access
          const hasPublicAccess = fileInfo.data.permissions?.some(
            (p: any) => p.type === 'anyone' && p.role === 'reader'
          );

          if (!hasPublicAccess) {
            // Add view-only permission for anyone with link
            await drive.permissions.create({
              fileId,
              requestBody: {
                type: 'anyone',
                role: 'reader'
              }
            });
          }

          results.push({
            originalUrl: link,
            newUrl: fileInfo.data.webViewLink || link,
            status: 'success',
            mode: 'permissions-updated'
          });
        } catch (permError: any) {
          results.push({
            originalUrl: link,
            status: 'error',
            error: `Cannot update permissions: ${permError.message}. You might not be the owner of this file.`
          });
        }
      } else {
        // Original copy mode (if storage is available)
        try {
          const copyResult = await drive.files.copy({
            fileId,
            requestBody: {
              name: `${fileInfo.data.name} - Copy (View Only)`
            }
          });

          // Set the copy to view-only
          await drive.permissions.create({
            fileId: copyResult.data.id,
            requestBody: {
              type: 'anyone',
              role: 'reader'
            }
          });

          // Get the web view link
          const copiedFile = await drive.files.get({
            fileId: copyResult.data.id,
            fields: 'webViewLink'
          });

          results.push({
            originalUrl: link,
            newUrl: copiedFile.data.webViewLink || '',
            status: 'success',
            mode: 'copied'
          });
        } catch (copyError: any) {
          // If copy fails due to quota, fall back to permissions-only
          if (copyError.message?.includes('quota')) {
            results.push({
              originalUrl: link,
              status: 'error',
              error: 'Storage quota exceeded. Run "npm run cleanup" to free up space, or use permissions-only mode.'
            });
          } else {
            results.push({
              originalUrl: link,
              status: 'error',
              error: copyError.message
            });
          }
        }
      }
    } catch (error: any) {
      console.error(`Error processing ${link}:`, error);
      results.push({
        originalUrl: link,
        status: 'error',
        error: error.message || 'Unknown error occurred'
      });
    }
  }

  res.json({ results });
});

function extractFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export default router;