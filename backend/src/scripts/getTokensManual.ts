import dotenv from 'dotenv';
import { google } from 'googleapis';
import readline from 'readline';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Full Google Drive access scope + email scope
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Manual Token Generator ===\n');

// Generate a simpler URL that won't auto-redirect
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob' // This shows the code on screen instead of redirecting
});

console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. After granting permissions, Google will show you an authorization code');
console.log('3. It will be displayed on the screen (not in the URL)');
console.log('4. Copy that code\n');

rl.question('5. Paste the authorization code here: ', async (code) => {
  try {
    // Override the redirect URI for token exchange
    const oauth2ClientForToken = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    const { tokens } = await oauth2ClientForToken.getToken(code);
    
    // Get account info
    oauth2ClientForToken.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2ClientForToken });
    const { data } = await oauth2.userinfo.get();
    
    console.log('\n=== SUCCESS! ===\n');
    console.log(`Authenticated as: ${data.email}\n`);
    console.log('Add this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log('After adding the token, restart the server and the app will work without user login!');
    
    rl.close();
  } catch (error) {
    console.error('\nError getting tokens:', error);
    console.log('\nMake sure you copied the full code');
    rl.close();
  }
});