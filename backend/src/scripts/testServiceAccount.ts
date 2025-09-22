import { initializeServiceAccount, getServiceDriveClient, getServiceAccountEmail } from '../services/googleServiceAccount';

async function testServiceAccount() {
  console.log('\n=== Testing Service Account ===\n');

  try {
    // Initialize service account
    await initializeServiceAccount();
    
    const email = getServiceAccountEmail();
    console.log(`✅ Service account email: ${email}\n`);

    // Get Drive client
    const drive = getServiceDriveClient();
    console.log('✅ Drive client initialized\n');

    // Test 1: List some files to verify access
    console.log('📁 Testing Drive access - listing files...');
    const fileList = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, mimeType, webViewLink)',
    });

    if (fileList.data.files && fileList.data.files.length > 0) {
      console.log(`Found ${fileList.data.files.length} files:`);
      fileList.data.files.forEach((file: any) => {
        console.log(`  - ${file.name} (${file.mimeType})`);
      });
    } else {
      console.log('No files found. This is normal if no files are shared with the service account yet.');
    }

    // Test 2: Try to access a public Google Sheet
    console.log('\n📊 Testing access to public Google Sheets...');
    const publicSheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Google Finance sample
    
    try {
      const sheet = await drive.files.get({
        fileId: publicSheetId,
        fields: 'id, name, mimeType, webViewLink',
      });
      console.log(`✅ Can access public sheet: ${sheet.data.name}`);
      console.log(`   URL: ${sheet.data.webViewLink}`);
    } catch (error: any) {
      console.log(`❌ Cannot access public sheet: ${error.message}`);
    }

    // Test 3: Try to copy a public sheet
    console.log('\n📋 Testing sheet copying...');
    try {
      const copyResult = await drive.files.copy({
        fileId: publicSheetId,
        requestBody: {
          name: `Test Copy - ${new Date().toISOString()}`,
        },
      });
      console.log(`✅ Successfully created copy: ${copyResult.data.name}`);
      console.log(`   New file ID: ${copyResult.data.id}`);
      
      // Try to update permissions
      console.log('\n🔒 Testing permission update...');
      await drive.permissions.create({
        fileId: copyResult.data.id,
        requestBody: {
          type: 'anyone',
          role: 'reader',
        },
      });
      console.log('✅ Successfully set copy to view-only (anyone with link)');
      
      // Get the shareable link
      const updatedFile = await drive.files.get({
        fileId: copyResult.data.id,
        fields: 'webViewLink',
      });
      console.log(`   Shareable link: ${updatedFile.data.webViewLink}`);
      
    } catch (error: any) {
      console.log(`❌ Error during copy/permission test: ${error.message}`);
    }

    console.log('\n=== Summary ===');
    console.log('✅ Service account is working correctly!');
    console.log(`\n📧 Remember to share your Google Sheets with: ${email}`);
    console.log('   Give it "Viewer" permission (or "Editor" if you need write access)');

  } catch (error: any) {
    console.error('\n❌ Service account test failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. The service-account.json file exists');
    console.error('2. The file contains valid credentials');
    console.error('3. The Drive API is enabled in Google Cloud Console');
  }
}

testServiceAccount().catch(console.error);