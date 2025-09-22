import { initializeServiceAccount, getServiceDriveClient } from '../services/googleServiceAccount';
import { google } from 'googleapis';

async function testSpecificCells() {
  console.log('\n=== Testing Specific Cell Reading ===\n');

  try {
    await initializeServiceAccount();
    const drive = getServiceDriveClient();
    const auth = (drive as any).context._options.auth;
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Your sheet ID
    const spreadsheetId = '1vGkjj7wuGs_Yw3U8trY39B_Bwo8PdRH6zXfg-X_apAs';
    
    console.log('📊 Testing different cell/range patterns...\n');
    
    // Test 1: Specific cells
    console.log('1️⃣ Reading specific individual cells (A1, B1, C1):');
    try {
      const cellsResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: ['A1', 'B1', 'C1', 'A2', 'B2']
      });
      
      cellsResponse.data.valueRanges?.forEach((range, index) => {
        const cell = ['A1', 'B1', 'C1', 'A2', 'B2'][index];
        const value = range.values?.[0]?.[0] || '(empty)';
        console.log(`   ${cell}: ${value}`);
      });
    } catch (error: any) {
      console.error('   Error:', error.message);
    }
    
    // Test 2: Get sheet names first
    console.log('\n2️⃣ Getting all sheet/tab names:');
    try {
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title'
      });
      
      const sheetNames = metadata.data.sheets?.map(s => s.properties?.title) || [];
      sheetNames.forEach((name, index) => {
        console.log(`   Tab ${index + 1}: "${name}"`);
      });
      
      // Test 3: Read from specific tab (if there are multiple tabs)
      if (sheetNames.length > 0) {
        const firstTab = sheetNames[0];
        console.log(`\n3️⃣ Reading from specific tab "${firstTab}":`);
        
        // Format: 'SheetName'!Range
        const tabRange = `'${firstTab}'!A1:C3`;
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: tabRange
        });
        
        console.log(`   Range: ${tabRange}`);
        response.data.values?.forEach((row, rowIndex) => {
          console.log(`   Row ${rowIndex + 1}: ${row.join(' | ')}`);
        });
      }
    } catch (error: any) {
      console.error('   Error:', error.message);
    }
    
    // Test 4: Multiple ranges from different tabs
    console.log('\n4️⃣ Reading multiple ranges (including from specific tabs):');
    try {
      // You can specify ranges like:
      // - 'A1:B2' (from default/first sheet)
      // - 'Sheet2!A1:B2' (from specific sheet)
      // - "'My Sheet Name'!A1:B2" (sheet names with spaces need quotes)
      const ranges = [
        'A1:B2',                    // From default sheet
        "'Copy of Sheet8'!A1:C2",   // From your specific tab
        'D1:E2',                    // Another range from default sheet
      ];
      
      const multiResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges
      });
      
      multiResponse.data.valueRanges?.forEach((range, index) => {
        console.log(`\n   Range "${ranges[index]}":`);
        range.values?.forEach((row, rowIndex) => {
          console.log(`     Row ${rowIndex + 1}: ${row.join(' | ')}`);
        });
      });
    } catch (error: any) {
      console.error('   Error:', error.message);
    }
    
    // Test 5: Named ranges (if any exist)
    console.log('\n5️⃣ Checking for named ranges:');
    try {
      const namedRanges = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'namedRanges'
      });
      
      if (namedRanges.data.namedRanges && namedRanges.data.namedRanges.length > 0) {
        console.log('   Found named ranges:');
        namedRanges.data.namedRanges.forEach(nr => {
          console.log(`   - ${nr.name}`);
        });
      } else {
        console.log('   No named ranges found in this sheet');
      }
    } catch (error: any) {
      console.error('   Error:', error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
  }
}

// Examples of valid range formats
console.log('\n📝 Valid range format examples:');
console.log('   - A1              (single cell)');
console.log('   - A1:B10          (range on default sheet)');
console.log('   - Sheet2!A1:B10   (range on specific sheet)');
console.log("   - 'My Sheet'!A1   (sheet name with spaces needs quotes)");
console.log('   - A:A             (entire column A)');
console.log('   - 1:1             (entire row 1)');
console.log('   - A1:Z            (from A1 to end of sheet)');

testSpecificCells().catch(console.error);