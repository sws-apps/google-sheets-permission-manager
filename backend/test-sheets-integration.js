#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

async function testSheetsIntegration() {
  console.log('🧪 Testing Google Sheets Integration...\n');
  
  try {
    // Step 1: Get service account email
    console.log('1️⃣ Fetching service account email...');
    const emailResponse = await axios.get(`${API_BASE_URL}/api/template/service-account-email`);
    
    if (emailResponse.data.success) {
      console.log(`✅ Service account email: ${emailResponse.data.email}`);
      console.log('   Share your Google Sheet with this email to grant access.\n');
    } else {
      console.log('❌ Failed to get service account email\n');
      return;
    }
    
    // Step 2: Test with a sample Google Sheets URL (user would need to replace this)
    const testSheetsUrl = 'https://docs.google.com/spreadsheets/d/1234567890/edit';
    console.log('2️⃣ Testing Google Sheets extraction...');
    console.log(`   URL: ${testSheetsUrl}`);
    console.log('   (This will fail unless you have a real sheet shared with the service account)\n');
    
    try {
      const extractResponse = await axios.post(`${API_BASE_URL}/api/template/extract-from-sheets`, {
        sheetsUrl: testSheetsUrl
      });
      
      if (extractResponse.data.success) {
        console.log('✅ Successfully extracted data from Google Sheets!');
        console.log(`   Data sections: ${Object.keys(extractResponse.data.data).join(', ')}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  Expected error: Spreadsheet not found (use a real Google Sheets URL)');
      } else if (error.response?.status === 403) {
        console.log('⚠️  Expected error: Access denied (share the sheet with the service account)');
        console.log(`   Service account: ${emailResponse.data.email}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n✨ Integration test complete!');
    console.log('\n📝 To use the Google Sheets integration:');
    console.log('   1. Create or open a Google Sheet with your ERC template data');
    console.log(`   2. Share it with: ${emailResponse.data.email}`);
    console.log('   3. Copy the sheet URL');
    console.log('   4. Paste it in the frontend application');
    console.log('   5. Click "Process" to import the data\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the backend server is running on port 5001');
    }
  }
}

// Run the test
testSheetsIntegration();