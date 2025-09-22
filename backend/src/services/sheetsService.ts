import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Service for interacting with Google Sheets API
 * This allows reading and writing specific cell data
 */

export interface CellData {
  range: string;
  values: any[][];
}

export class SheetsService {
  private sheets: sheets_v4.Sheets;

  constructor(auth: OAuth2Client) {
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  /**
   * Read data from a specific range in a sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation range (e.g., 'Sheet1!A1:B10')
   */
  async readRange(spreadsheetId: string, range: string): Promise<CellData> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return {
        range: response.data.range || range,
        values: response.data.values || [],
      };
    } catch (error) {
      console.error('Error reading sheet range:', error);
      throw error;
    }
  }

  /**
   * Read multiple ranges from a sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param ranges Array of A1 notation ranges
   */
  async readMultipleRanges(spreadsheetId: string, ranges: string[]): Promise<CellData[]> {
    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      });

      return response.data.valueRanges?.map(vr => ({
        range: vr.range || '',
        values: vr.values || [],
      })) || [];
    } catch (error) {
      console.error('Error reading multiple ranges:', error);
      throw error;
    }
  }

  /**
   * Write data to a specific range in a sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The A1 notation range
   * @param values 2D array of values to write
   */
  async writeRange(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error writing to sheet:', error);
      throw error;
    }
  }

  /**
   * Get sheet metadata (title, dimensions, etc.)
   * @param spreadsheetId The ID of the spreadsheet
   */
  async getSheetMetadata(spreadsheetId: string) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
      });

      return {
        title: response.data.properties?.title,
        sheets: response.data.sheets?.map(sheet => ({
          sheetId: sheet.properties?.sheetId,
          title: sheet.properties?.title,
          rowCount: sheet.properties?.gridProperties?.rowCount,
          columnCount: sheet.properties?.gridProperties?.columnCount,
        })),
      };
    } catch (error) {
      console.error('Error getting sheet metadata:', error);
      throw error;
    }
  }

  /**
   * Example: Read specific cells like A1, B2, C3
   */
  async readSpecificCells(spreadsheetId: string, cells: string[]): Promise<{ [cell: string]: any }> {
    const ranges = cells.map(cell => `Sheet1!${cell}`);
    const data = await this.readMultipleRanges(spreadsheetId, ranges);
    
    const result: { [cell: string]: any } = {};
    cells.forEach((cell, index) => {
      result[cell] = data[index]?.values?.[0]?.[0] || null;
    });
    
    return result;
  }
}

// Example usage:
/*
const sheetsService = new SheetsService(oauth2Client);

// Read a range
const data = await sheetsService.readRange('SHEET_ID', 'Sheet1!A1:D10');

// Read specific cells
const cells = await sheetsService.readSpecificCells('SHEET_ID', ['A1', 'B2', 'C3']);

// Write data
await sheetsService.writeRange('SHEET_ID', 'Sheet1!A1:B2', [
  ['Hello', 'World'],
  ['Foo', 'Bar']
]);
*/