import * as XLSX from 'xlsx';
import { google, sheets_v4 } from 'googleapis';
import { getServiceAccountEmail } from './googleServiceAccount';

/**
 * Service to convert Google Sheets data to XLSX format
 * Preserves sheet structure and cell positions for ERC template processing
 */
export class SheetsToExcelConverter {
  private sheets: sheets_v4.Sheets;
  
  constructor(auth: any) {
    this.sheets = google.sheets({ version: 'v4', auth });
  }

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
   * Convert Google Sheets to XLSX buffer
   */
  async convertSheetsToExcel(spreadsheetIdOrUrl: string): Promise<Buffer> {
    const spreadsheetId = SheetsToExcelConverter.extractSpreadsheetId(spreadsheetIdOrUrl) || spreadsheetIdOrUrl;
    
    if (!spreadsheetId) {
      throw new Error('Invalid Google Sheets URL or ID');
    }

    try {
      // Get spreadsheet metadata to find all sheets
      const metadata = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false
      });

      if (!metadata.data.sheets || metadata.data.sheets.length === 0) {
        throw new Error('No sheets found in the spreadsheet');
      }

      // Create new workbook
      const workbook = XLSX.utils.book_new();
      
      // Process each sheet
      for (const sheet of metadata.data.sheets) {
        const sheetName = sheet.properties?.title || 'Sheet1';
        const rowCount = sheet.properties?.gridProperties?.rowCount || 1000;
        const columnCount = sheet.properties?.gridProperties?.columnCount || 26;
        
        // Calculate range (A1 to last cell)
        const lastColumn = this.columnIndexToLetter(columnCount - 1);
        const range = `${sheetName}!A1:${lastColumn}${rowCount}`;
        
        try {
          // Fetch sheet data
          const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            valueRenderOption: 'UNFORMATTED_VALUE', // Get raw values
            dateTimeRenderOption: 'FORMATTED_STRING'
          });

          const values = response.data.values || [];
          
          // Convert to worksheet
          // Important: Preserve empty cells to maintain cell positions
          const worksheet = this.createWorksheetWithSparseData(values, rowCount, columnCount);
          
          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
          
        } catch (sheetError) {
          console.warn(`Warning: Could not read sheet "${sheetName}":`, sheetError);
          // Add empty sheet to maintain structure
          const emptySheet = XLSX.utils.aoa_to_sheet([[]]);
          XLSX.utils.book_append_sheet(workbook, emptySheet, sheetName);
        }
      }

      // Convert workbook to buffer
      const buffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx',
        compression: false // No compression for compatibility
      });

      return Buffer.from(buffer);

    } catch (error) {
      // Enhanced error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          const serviceEmail = getServiceAccountEmail();
          throw new Error(
            `Access denied. Please share your Google Sheet with the service account: ${serviceEmail}`
          );
        }
        if (error.message.includes('404')) {
          throw new Error('Spreadsheet not found. Please check the URL and try again.');
        }
      }
      throw error;
    }
  }

  /**
   * Create worksheet preserving cell positions (important for template mapping)
   */
  private createWorksheetWithSparseData(
    values: any[][], 
    maxRows: number, 
    maxCols: number
  ): XLSX.WorkSheet {
    const worksheet: XLSX.WorkSheet = {};
    
    // Process each row
    values.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          
          // Determine cell type and create cell object
          let cell: XLSX.CellObject;
          
          if (typeof cellValue === 'number') {
            cell = { t: 'n', v: cellValue };
          } else if (typeof cellValue === 'boolean') {
            cell = { t: 'b', v: cellValue };
          } else if (cellValue instanceof Date) {
            cell = { t: 'd', v: cellValue };
          } else {
            // Default to string
            cell = { t: 's', v: String(cellValue) };
          }
          
          worksheet[cellAddress] = cell;
        }
      });
    });
    
    // Set worksheet range
    const range = {
      s: { r: 0, c: 0 },
      e: { r: Math.max(values.length - 1, 0), c: maxCols - 1 }
    };
    worksheet['!ref'] = XLSX.utils.encode_range(range);
    
    return worksheet;
  }

  /**
   * Convert column index to letter (0 -> A, 1 -> B, 26 -> AA, etc.)
   */
  private columnIndexToLetter(index: number): string {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  }

  /**
   * Validate if URL is a Google Sheets URL
   */
  static isValidGoogleSheetsUrl(url: string): boolean {
    return /docs\.google\.com\/spreadsheets/.test(url) || 
           /^[a-zA-Z0-9-_]+$/.test(url); // Also accept just the ID
  }
}