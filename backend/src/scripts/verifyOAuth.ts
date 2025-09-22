import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

console.log('\n=== OAuth Configuration Verification ===\n');

async function verifyOAuthSetup() {
  const issues: string[] = [];
  const warnings: string[] = [];
  const successes: string[] = [];

  // 1. Check environment variables
  console.log('1. Checking environment variables...');
  if (!process.env.GOOGLE_CLIENT_ID) {
    issues.push('❌ GOOGLE_CLIENT_ID is not set in .env');
  } else {
    successes.push('✅ GOOGLE_CLIENT_ID is configured');
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    issues.push('❌ GOOGLE_CLIENT_SECRET is not set in .env');
  } else {
    successes.push('✅ GOOGLE_CLIENT_SECRET is configured');
  }

  if (!process.env.GOOGLE_REDIRECT_URI) {
    issues.push('❌ GOOGLE_REDIRECT_URI is not set in .env');
  } else {
    successes.push('✅ GOOGLE_REDIRECT_URI is configured');
    console.log(`   Redirect URI: ${process.env.GOOGLE_REDIRECT_URI}`);
  }

  const port = process.env.PORT || 5000;
  console.log(`   Backend Port: ${port}`);

  // 2. Check if redirect URI matches port
  console.log('\n2. Checking redirect URI consistency...');
  if (process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI.includes(`:${port}/`)) {
    warnings.push(`⚠️  Redirect URI uses different port than backend (${port})`);
  } else {
    successes.push('✅ Redirect URI port matches backend port');
  }

  // 3. Test OAuth client initialization
  console.log('\n3. Testing OAuth client initialization...');
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    successes.push('✅ OAuth client initialized successfully');
  } catch (error: any) {
    issues.push(`❌ Failed to initialize OAuth client: ${error.message}`);
  }

  // 4. Check if server is running
  console.log('\n4. Checking if backend server is running...');
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    if (response.ok) {
      successes.push(`✅ Backend server is running on port ${port}`);
    }
  } catch (error) {
    warnings.push(`⚠️  Backend server is not running on port ${port}. Start it with: npm run dev`);
  }

  // 5. Test server authentication status
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    console.log('\n5. Testing server authentication...');
    try {
      const response = await fetch(`http://localhost:${port}/api/auth/verify?server=true`);
      if (response.ok) {
        const data = await response.json() as { isValid: boolean; accountInfo?: { email: string } };
        if (data.isValid) {
          successes.push('✅ Server authentication is working');
          if (data.accountInfo) {
            console.log(`   Authenticated as: ${data.accountInfo.email}`);
          }
        } else {
          warnings.push('⚠️  Server authentication is configured but not working properly');
        }
      }
    } catch (error) {
      warnings.push('⚠️  Could not verify server authentication');
    }
  }

  // Display summary
  console.log('\n=== Summary ===\n');
  
  if (successes.length > 0) {
    console.log('Successes:');
    successes.forEach(s => console.log(s));
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(w));
  }

  if (issues.length > 0) {
    console.log('\nIssues to fix:');
    issues.forEach(i => console.log(i));
    
    console.log('\n🔧 To fix redirect_uri_mismatch:');
    console.log('1. Run: npm run show-redirect-uri');
    console.log('2. Add the shown URI to Google Cloud Console');
    console.log('3. Make sure to save the changes in Google Cloud Console');
  } else {
    console.log('\n✅ OAuth configuration looks good!');
    console.log('\nNext steps:');
    console.log('1. Make sure your redirect URI is added to Google Cloud Console');
    console.log('2. Run: npm run get-tokens (to set up server authentication)');
    console.log('3. Try authenticating through the web interface');
  }
}

verifyOAuthSetup().catch(console.error);