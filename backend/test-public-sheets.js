const https = require('https');
const fs = require('fs');

// Test downloading a public Google Sheet
const testPublicSheet = () => {
  const spreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Google's example sheet
  const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
  
  console.log('Testing public Google Sheets download...');
  console.log(`URL: ${exportUrl}\n`);
  
  const file = fs.createWriteStream('test-sheet.xlsx');
  
  https.get(exportUrl, (response) => {
    console.log(`Status: ${response.statusCode}`);
    console.log(`Headers: ${JSON.stringify(response.headers['content-type'])}\n`);
    
    if (response.statusCode === 200) {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync('test-sheet.xlsx');
        console.log(`✅ Successfully downloaded public sheet!`);
        console.log(`   File size: ${stats.size} bytes`);
        console.log(`   Saved as: test-sheet.xlsx`);
        console.log('\n✨ Public sheets download is working!');
        
        // Clean up
        fs.unlinkSync('test-sheet.xlsx');
      });
    } else {
      console.log(`❌ Failed to download: HTTP ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`❌ Error: ${err.message}`);
  });
};

testPublicSheet();