import { initializeServiceAccount, getServiceDriveClient } from '../services/googleServiceAccount';
import { google } from 'googleapis';

async function testReadSheet() {
  console.log('\n=== Testing Sheet Reading ===\n');

  try {
    // Initialize service account
    await initializeServiceAccount();
    const drive = getServiceDriveClient();
    
    // Get the auth from drive service
    const auth = (drive as any).context._options.auth;
    
    // Initialize Sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test with your sheet
    const spreadsheetId = '1vGkjj7wuGs_Yw3U8trY39B_Bwo8PdRH6zXfg-X_apAs';
    
    console.log('📊 Reading data from your sheet...\n');
    
    try {
      // Get sheet metadata
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'properties.title,sheets.properties'
      });
      
      console.log(`Sheet Title: ${metadata.data.properties?.title}`);
      console.log(`Number of tabs: ${metadata.data.sheets?.length || 0}`);
      
      // List all sheet tabs
      if (metadata.data.sheets) {
        console.log('\nSheet tabs:');
        metadata.data.sheets.forEach((sheet, index) => {
          console.log(`  ${index + 1}. ${sheet.properties?.title}`);
        });
      }
      
      // Read data from first sheet (A1:Z10)
      console.log('\n📋 Reading data from range A1:Z10...\n');
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:Z10', // Adjust this range as needed
      });
      
      const values = response.data.values;
      
      if (values && values.length > 0) {
        console.log('Data found:');
        values.forEach((row, rowIndex) => {
          console.log(`Row ${rowIndex + 1}: ${row.join(' | ')}`);
        });
      } else {
        console.log('No data found in the specified range.');
      }
      
      // Example: Read specific cells
      console.log('\n📍 Reading specific cells (A1, B1, C1)...\n');
      
      const cellsResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: ['A1', 'B1', 'C1']
      });
      
      cellsResponse.data.valueRanges?.forEach((range, index) => {
        const cell = ['A1', 'B1', 'C1'][index];
        const value = range.values?.[0]?.[0] || '(empty)';
        console.log(`${cell}: ${value}`);
      });
      
    } catch (error: any) {
      console.error('❌ Error reading sheet:', error.message);
      
      if (error.code === 403) {
        console.log('\n⚠️  Make sure the sheet is shared with: sheets-manager@sheet-automation-ppp-naics.iam.gserviceaccount.com');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Failed to initialize:', error.message);
  }
}

// Test with a public sheet first
async function testPublicSheet() {
  console.log('\n=== Testing with Public Google Sheet ===\n');
  
  try {
    await initializeServiceAccount();
    const drive = getServiceDriveClient();
    const auth = (drive as any).context._options.auth;
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Google's public finance sample sheet
    const publicSheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: publicSheetId,
      range: 'A1:E5',
    });
    
    console.log('✅ Successfully read public sheet!');
    console.log('First 5 rows:');
    response.data.values?.forEach((row, index) => {
      console.log(`Row ${index + 1}: ${row.join(' | ')}`);
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run both tests
async function runTests() {
  await testPublicSheet();
  console.log('\n' + '='.repeat(50) + '\n');
  await testReadSheet();
}

runTests().catch(console.error);