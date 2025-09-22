import { initializeServiceAccount, getServiceDriveClient, getServiceAccountEmail } from '../services/googleServiceAccount';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanupDrive() {
  console.log('\n=== Service Account Drive Cleanup ===\n');

  try {
    // Initialize service account
    await initializeServiceAccount();
    const drive = getServiceDriveClient();
    const email = getServiceAccountEmail();
    
    console.log(`📧 Service account: ${email}\n`);
    console.log('🔍 Scanning Drive for files...\n');

    // Get all files from the service account's Drive
    let allFiles: any[] = [];
    let nextPageToken: string | undefined;
    
    do {
      const response = await drive.files.list({
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink)',
        pageToken: nextPageToken,
        orderBy: 'createdTime desc'
      });
      
      if (response.data.files) {
        allFiles = allFiles.concat(response.data.files);
      }
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    if (allFiles.length === 0) {
      console.log('✨ No files found in Drive. Storage is already empty!');
      rl.close();
      return;
    }

    // Calculate total size
    let totalSize = 0;
    const spreadsheets = allFiles.filter(file => file.mimeType === 'application/vnd.google-apps.spreadsheet');
    const otherFiles = allFiles.filter(file => file.mimeType !== 'application/vnd.google-apps.spreadsheet');

    // Note: Google Sheets don't have a size property, so we'll estimate
    console.log(`📊 Found ${allFiles.length} total files:`);
    console.log(`   - ${spreadsheets.length} Google Sheets`);
    console.log(`   - ${otherFiles.length} other files\n`);

    // Show recent files
    console.log('📋 Recent files (newest first):');
    const recentFiles = allFiles.slice(0, 10);
    recentFiles.forEach((file, index) => {
      const date = new Date(file.createdTime).toLocaleDateString();
      console.log(`${index + 1}. ${file.name} (${date})`);
    });

    if (allFiles.length > 10) {
      console.log(`... and ${allFiles.length - 10} more files\n`);
    }

    // Ask for confirmation
    const question = `\n⚠️  Do you want to delete ALL ${allFiles.length} files? This cannot be undone! (yes/no): `;
    
    rl.question(question, async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('\n🗑️  Deleting files...');
        
        let deleted = 0;
        let failed = 0;
        
        for (const file of allFiles) {
          try {
            await drive.files.delete({ fileId: file.id });
            deleted++;
            
            // Show progress every 10 files
            if (deleted % 10 === 0) {
              console.log(`   Deleted ${deleted}/${allFiles.length} files...`);
            }
          } catch (error) {
            failed++;
            console.log(`   ❌ Failed to delete: ${file.name}`);
          }
        }
        
        console.log(`\n✅ Cleanup complete!`);
        console.log(`   - Deleted: ${deleted} files`);
        console.log(`   - Failed: ${failed} files`);
        console.log('\n🎉 Your service account Drive is now clean!');
        
      } else {
        console.log('\n❌ Cleanup cancelled. No files were deleted.');
        
        // Offer selective deletion
        rl.question('\nWould you like to delete only old copies? (yes/no): ', async (answer2) => {
          if (answer2.toLowerCase() === 'yes') {
            const copies = allFiles.filter(file => 
              file.name.includes('Copy') || 
              file.name.includes('(View Only)')
            );
            
            if (copies.length === 0) {
              console.log('No copy files found.');
            } else {
              console.log(`\nFound ${copies.length} copy files. Deleting...`);
              
              let deleted = 0;
              for (const file of copies) {
                try {
                  await drive.files.delete({ fileId: file.id });
                  deleted++;
                } catch (error) {
                  console.log(`Failed to delete: ${file.name}`);
                }
              }
              
              console.log(`✅ Deleted ${deleted} copy files!`);
            }
          }
          rl.close();
        });
        return;
      }
      rl.close();
    });

  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message);
    rl.close();
  }
}

// Also provide a function to check storage usage
async function checkStorageUsage() {
  try {
    await initializeServiceAccount();
    const drive = getServiceDriveClient();
    
    // Get storage quota
    const about = await drive.about.get({
      fields: 'storageQuota, user'
    });
    
    const quota = about.data.storageQuota;
    if (quota) {
      const usedGB = (parseInt(quota.usage || '0') / 1024 / 1024 / 1024).toFixed(2);
      const limitGB = (parseInt(quota.limit || '0') / 1024 / 1024 / 1024).toFixed(2);
      
      console.log('\n📊 Storage Usage:');
      console.log(`   Used: ${usedGB} GB`);
      console.log(`   Limit: ${limitGB} GB`);
      console.log(`   Available: ${(parseFloat(limitGB) - parseFloat(usedGB)).toFixed(2)} GB`);
    }
  } catch (error) {
    console.log('Could not fetch storage quota');
  }
}

// Run the cleanup
cleanupDrive().catch(console.error);