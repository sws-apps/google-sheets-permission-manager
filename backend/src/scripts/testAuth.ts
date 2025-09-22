import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

async function testAuthentication() {
  console.log('\n=== Testing Google Authentication ===\n');

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    console.error('❌ No GOOGLE_REFRESH_TOKEN found in .env file');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    console.log('1. Setting refresh token...');
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    console.log('2. Refreshing access token...');
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('✅ Access token refreshed successfully');
    console.log(`   Token expires at: ${new Date(credentials.expiry_date!).toLocaleString()}`);

    console.log('\n3. Getting account info...');
    let accountEmail = 'Unknown';
    let accountName = 'Unknown';
    
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      console.log('✅ Account info retrieved successfully:');
      console.log(`   Email: ${data.email}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   ID: ${data.id}`);
      accountEmail = data.email || 'Unknown';
      accountName = data.name || 'Unknown';
    } catch (error: any) {
      console.log('⚠️  Could not retrieve account info (might not have userinfo scope)');
      console.log(`   Error: ${error.message}`);
      console.log('   This is not critical - Drive access might still work');
    }

    console.log('\n4. Testing Drive API access...');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // List a few files to test access
    const fileList = await drive.files.list({
      pageSize: 5,
      fields: 'files(id, name, mimeType)',
    });

    console.log('✅ Drive API access successful');
    console.log(`   Found ${fileList.data.files?.length || 0} files:`);
    fileList.data.files?.forEach(file => {
      console.log(`   - ${file.name} (${file.mimeType})`);
    });

    console.log('\n5. Testing access to specific sheet...');
    const testSheetId = '1vGkjj7wuGs_Yw3U8trY39B_Bwo8PdRH6zXfg-X_apAs'; // The problematic sheet
    try {
      const sheet = await drive.files.get({
        fileId: testSheetId,
        fields: 'name, owners, permissions',
      });
      console.log(`✅ Can access sheet: ${sheet.data.name}`);
    } catch (error: any) {
      console.log(`❌ Cannot access sheet: ${error.message}`);
      console.log(`   This sheet needs to be shared with the server's Google account`);
    }

    console.log('\n=== Summary ===');
    console.log('✅ Authentication is working correctly');
    console.log(`📧 Server is authenticated as: ${accountEmail}`);
    console.log('\n⚠️  Important: Any Google Sheets you want to process must be:');
    console.log(`   1. Shared with the server's Google account${accountEmail !== 'Unknown' ? ` (${accountEmail})` : ''}`);
    console.log('   2. Given at least "Viewer" permissions');
    console.log('   3. Or be publicly accessible (anyone with link)');

  } catch (error: any) {
    console.error('\n❌ Authentication failed:', error.message);
    console.error('\nPossible reasons:');
    console.error('1. The refresh token is invalid or expired');
    console.error('2. The OAuth client credentials have changed');
    console.error('3. The Google account revoked access');
    console.error('\nSolution: Run "npm run get-tokens" to generate a new refresh token');
    process.exit(1);
  }
}

testAuthentication();