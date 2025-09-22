import dotenv from 'dotenv';

dotenv.config();

console.log('\n=== Google OAuth Redirect URI Configuration ===\n');

const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'Not configured';
const clientId = process.env.GOOGLE_CLIENT_ID || 'Not configured';
const port = process.env.PORT || 5000;

console.log('Your current configuration:');
console.log(`- Client ID: ${clientId}`);
console.log(`- Redirect URI: ${redirectUri}`);
console.log(`- Backend Port: ${port}\n`);

console.log('⚠️  IMPORTANT: Copy this EXACT redirect URI to Google Cloud Console:\n');
console.log(`>>> ${redirectUri} <<<\n`);

console.log('Steps to fix the redirect_uri_mismatch error:');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Select your project');
console.log('3. Go to "APIs & Services" → "Credentials"');
console.log(`4. Find OAuth client with ID: ${clientId.substring(0, 20)}...`);
console.log('5. Click on it to edit');
console.log('6. Under "Authorized redirect URIs", add:');
console.log(`   ${redirectUri}`);
console.log('7. Click "Save"\n');

console.log('💡 Tips:');
console.log('- Make sure there are NO trailing slashes');
console.log('- The URI must match EXACTLY (including http vs https)');
console.log('- You can add multiple URIs if you use different ports');
console.log('- Common URIs to add:');
console.log('  - http://localhost:5000/api/auth/google/callback');
console.log('  - http://localhost:5001/api/auth/google/callback');
console.log('  - http://localhost:3000/api/auth/google/callback\n');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
  console.log('❌ ERROR: Missing configuration in .env file!');
  console.log('Make sure your .env file contains:');
  console.log('- GOOGLE_CLIENT_ID');
  console.log('- GOOGLE_REDIRECT_URI');
}