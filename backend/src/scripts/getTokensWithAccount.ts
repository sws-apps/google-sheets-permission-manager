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

console.log('\n=== Google Drive Token Generator ===\n');
console.log('This script will help you get the access tokens needed for server-side authentication.\n');
console.log('IMPORTANT: These tokens will give FULL access to your Google Drive.\n');

// Ask for the account hint
rl.question('Enter the email address of the Google account you want to use (e.g., user@gmail.com): ', (email) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    // Use login_hint to suggest the account
    login_hint: email,
    // Also try hd parameter if it's a G Suite domain
    hd: email.includes('@') ? email.split('@')[1] : undefined
  });

  console.log('\n1. Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nIf you\'re not automatically logged in as ' + email + ', you can:');
  console.log('- Add &authuser=1 to the URL (or 2, 3, etc. based on account order)');
  console.log('- Or sign out of other accounts first');
  console.log('\n2. Grant permissions and copy the code from the URL\n');

  rl.question('3. Enter the authorization code here: ', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      // Get account info to confirm
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      
      console.log('\n=== SUCCESS! ===\n');
      console.log(`Authenticated as: ${data.email}\n`);
      console.log('Add these to your .env file:\n');
      console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log('The refresh token never expires, so you only need to do this once.');
      console.log('After adding these tokens, restart the server and the app will work without user login!');
      
      rl.close();
    } catch (error) {
      console.error('\nError getting tokens:', error);
      console.log('\nMake sure you copied the full code from the URL');
      rl.close();
    }
  });
});