import React from 'react';
import { Container, Paper, Typography, Box, Link, Divider } from '@mui/material';

export const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Privacy Policy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
          Effective Date: December 2024
        </Typography>

        <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& h3': { mt: 3, mb: 1.5 }, '& p': { mb: 2 }, '& ul': { mb: 2 } }}>
          <Typography variant="h5" component="h2">
            1. Introduction
          </Typography>
          <Typography paragraph>
            Welcome to Google Sheets Permission Manager ("we," "our," or "the Application"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
          </Typography>
          <Typography paragraph>
            By using our Application, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use the Application.
          </Typography>

          <Typography variant="h5" component="h2">
            2. Information We Collect
          </Typography>
          
          <Typography variant="h6" component="h3">
            2.1 Information You Provide
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography><strong>Google Account Information:</strong> When you sign in with Google, we receive your basic profile information (name and email address) through Google OAuth 2.0.</Typography>
            </li>
            <li>
              <Typography><strong>File Information:</strong> Names and URLs of Google Sheets you select for processing, and any CSV/Excel files you upload containing Google Sheets URLs.</Typography>
            </li>
          </Box>

          <Typography variant="h6" component="h3">
            2.2 Information Automatically Collected
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography><strong>OAuth Tokens:</strong> Temporary access tokens to interact with Google APIs on your behalf (stored only in your browser's local storage).</Typography>
            </li>
            <li>
              <Typography><strong>Usage Data:</strong> Basic application usage information such as features accessed and actions performed.</Typography>
            </li>
          </Box>

          <Typography variant="h5" component="h2">
            3. How We Use Your Information
          </Typography>
          <Typography paragraph>
            We use your information solely to provide and improve our services:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><Typography>To authenticate you via Google OAuth</Typography></li>
            <li><Typography>To access and process Google Sheets you explicitly select</Typography></li>
            <li><Typography>To create view-only copies of your selected Google Sheets</Typography></li>
            <li><Typography>To manage permissions on Google Drive files as requested</Typography></li>
            <li><Typography>To extract and process Employee Retention Credit (ERC) data from templates</Typography></li>
            <li><Typography>To provide the services you request through the Application</Typography></li>
          </Box>

          <Typography variant="h5" component="h2">
            4. Google API Services
          </Typography>
          <Typography paragraph>
            Our Application uses Google API Services, including Google Drive API and Google Sheets API. Our use of information received from Google APIs adheres to the{' '}
            <Link href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">
              Google API Services User Data Policy
            </Link>
            , including the Limited Use requirements.
          </Typography>
          <Typography paragraph>
            <strong>Scope of Access:</strong> We only request access to:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><Typography>View and manage Google Drive files</Typography></li>
            <li><Typography>View and manage Google Sheets</Typography></li>
            <li><Typography>View your basic Google account information (email address)</Typography></li>
          </Box>

          <Typography variant="h5" component="h2">
            5. Data Storage and Security
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography><strong>No Persistent Storage:</strong> We do not store your Google account information, file contents, or processed data on our servers.</Typography>
            </li>
            <li>
              <Typography><strong>Local Storage Only:</strong> Authentication tokens are stored only in your browser's local storage and are cleared when you sign out.</Typography>
            </li>
            <li>
              <Typography><strong>Secure Transmission:</strong> All data transmission occurs over HTTPS encrypted connections.</Typography>
            </li>
            <li>
              <Typography><strong>No Third-Party Sharing:</strong> We do not sell, trade, or otherwise transfer your information to third parties.</Typography>
            </li>
          </Box>

          <Typography variant="h5" component="h2">
            6. Data Processing
          </Typography>
          <Typography paragraph>
            All processing of your Google Sheets occurs in real-time during your session. We do not retain copies of your sheets or their contents after processing is complete. Processed results are delivered directly to you and not stored on our servers.
          </Typography>

          <Typography variant="h5" component="h2">
            7. Your Rights and Controls
          </Typography>
          <Typography paragraph>You have the right to:</Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li>
              <Typography><strong>Access Control:</strong> Choose which Google Sheets to process</Typography>
            </li>
            <li>
              <Typography><strong>Revoke Access:</strong> Sign out at any time, which removes all stored tokens</Typography>
            </li>
            <li>
              <Typography>
                <strong>Google Account Settings:</strong> Manage or revoke our Application's access through your{' '}
                <Link href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
                  Google Account permissions
                </Link>
              </Typography>
            </li>
            <li>
              <Typography><strong>Data Deletion:</strong> Clear your browser's local storage to remove all stored authentication data</Typography>
            </li>
          </Box>

          <Typography variant="h5" component="h2">
            8. Children's Privacy
          </Typography>
          <Typography paragraph>
            Our Application is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Typography>

          <Typography variant="h5" component="h2">
            9. Third-Party Services
          </Typography>
          <Typography paragraph>
            Our Application integrates with Google Services only. We do not use any analytics, advertising, or tracking services. Your interaction with Google Services is governed by Google's Privacy Policy and Terms of Service.
          </Typography>

          <Typography variant="h5" component="h2">
            10. Data Breach Notification
          </Typography>
          <Typography paragraph>
            In the unlikely event of a data breach that affects your personal information, we will notify affected users via the email address associated with their Google account within 72 hours of becoming aware of the breach.
          </Typography>

          <Typography variant="h5" component="h2">
            11. International Data Transfers
          </Typography>
          <Typography paragraph>
            Your information may be processed in the country where our servers are located. By using our Application, you consent to the transfer of information to countries outside of your country of residence.
          </Typography>

          <Typography variant="h5" component="h2">
            12. Changes to This Privacy Policy
          </Typography>
          <Typography paragraph>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of this Privacy Policy.
          </Typography>
          <Typography paragraph>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </Typography>

          <Typography variant="h5" component="h2">
            13. Contact Information
          </Typography>
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>If you have questions or concerns about this Privacy Policy, please contact us:</strong>
            </Typography>
            <Typography variant="body2">
              Application: Google Sheets Permission Manager<br />
              Privacy Inquiries: privacy@yourcompany.com<br />
              Support: support@yourcompany.com
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              For Google-specific privacy concerns, please visit:{' '}
              <Link href="https://support.google.com/accounts/answer/3024190" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>
                Google Account Help
              </Link>
            </Typography>
          </Paper>

          <Typography variant="h5" component="h2">
            14. Compliance
          </Typography>
          <Typography paragraph>
            This Privacy Policy is designed to comply with applicable privacy laws and regulations, including but not limited to:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <li><Typography>General Data Protection Regulation (GDPR) for EU users</Typography></li>
            <li><Typography>California Consumer Privacy Act (CCPA) for California residents</Typography></li>
            <li><Typography>Google API Services User Data Policy</Typography></li>
          </Box>

          <Typography variant="h5" component="h2">
            15. Cookies
          </Typography>
          <Typography paragraph>
            Our Application uses only essential cookies required for authentication and session management. We do not use tracking or advertising cookies. You can control cookie settings through your browser preferences.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/" sx={{ mx: 2 }}>Return to Application</Link>
          <Link href="/terms" sx={{ mx: 2 }}>Terms of Service</Link>
        </Box>
      </Paper>
    </Container>
  );
};