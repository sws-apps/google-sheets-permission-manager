import * as XLSX from 'xlsx';
import axios from 'axios';

/**
 * Service to convert public Google Sheets to XLSX format
 * Works with sheets that have "Anyone with the link can view" permission
 */
export class PublicSheetsConverter {
  /**
   * Extract spreadsheet ID from Google Sheets URL
   */
  static extractSpreadsheetId(url: string): string | null {
    // Handle various Google Sheets URL formats
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/ // Just the ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Validate if URL is a Google Sheets URL
   */
  static isValidGoogleSheetsUrl(url: string): boolean {
    return /docs\.google\.com\/spreadsheets/.test(url) || 
           /^[a-zA-Z0-9-_]+$/.test(url); // Also accept just the ID
  }

  /**
   * Convert public Google Sheets to XLSX buffer using export URL
   * This works for sheets with "Anyone with the link can view" permission
   */
  async convertPublicSheetsToExcel(spreadsheetIdOrUrl: string): Promise<Buffer> {
    const spreadsheetId = PublicSheetsConverter.extractSpreadsheetId(spreadsheetIdOrUrl) || spreadsheetIdOrUrl;
    
    if (!spreadsheetId) {
      throw new Error('Invalid Google Sheets URL or ID');
    }

    try {
      // Use Google's export URL to download as XLSX
      // This works for public sheets without authentication
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
      
      console.log(`Attempting to download public sheet: ${spreadsheetId}`);
      
      // Download the XLSX file
      const response = await axios.get(exportUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        maxRedirects: 5, // Follow redirects
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,*/*'
        }
      });

      // Convert arraybuffer to Buffer
      const buffer = Buffer.from(response.data);
      
      // Validate that we got an actual XLSX file
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Downloaded file appears to be empty or invalid');
        }
        console.log(`Successfully downloaded sheet with ${workbook.SheetNames.length} tabs`);
      } catch (validationError) {
        throw new Error('Downloaded file is not a valid Excel file. The sheet may not be publicly accessible.');
      }
      
      return buffer;

    } catch (error: any) {
      // Enhanced error messages for common issues
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Spreadsheet not found. Please check the URL and try again.');
        }
        if (error.response?.status === 403 || error.response?.status === 401) {
          throw new Error('Access denied. Make sure the Google Sheet has "Anyone with the link can view" permission.');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid spreadsheet ID. Please check the URL format.');
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new Error('Request timed out. The sheet may be too large or network is slow.');
        }
      }
      
      // Re-throw with more context
      if (error instanceof Error) {
        if (error.message.includes('not a valid Excel file')) {
          throw new Error('The Google Sheet is not publicly accessible. Please make sure it has "Anyone with the link can view" permission.');
        }
        throw error;
      }
      
      throw new Error('Failed to download Google Sheet');
    }
  }

  /**
   * Try multiple methods to access a Google Sheet
   * First tries public export, then falls back to API if available
   */
  async convertSheetsToExcel(spreadsheetIdOrUrl: string, authOptional?: any): Promise<Buffer> {
    const spreadsheetId = PublicSheetsConverter.extractSpreadsheetId(spreadsheetIdOrUrl) || spreadsheetIdOrUrl;
    
    if (!spreadsheetId) {
      throw new Error('Invalid Google Sheets URL or ID');
    }

    // First, try to download as public sheet
    try {
      console.log('Attempting to access sheet as public document...');
      return await this.convertPublicSheetsToExcel(spreadsheetIdOrUrl);
    } catch (publicError) {
      console.log('Public access failed:', publicError instanceof Error ? publicError.message : 'Unknown error');
      
      // If auth is provided and public access failed, try with authentication
      if (authOptional) {
        console.log('Falling back to authenticated access...');
        const { SheetsToExcelConverter } = require('./sheetsToExcelConverter');
        const authConverter = new SheetsToExcelConverter(authOptional);
        return await authConverter.convertSheetsToExcel(spreadsheetIdOrUrl);
      }
      
      // Re-throw the public access error if no auth available
      throw publicError;
    }
  }
}