import { ExcelTemplateParser } from '../services/excelTemplateParser';
import { FlexibleTemplateParser } from '../services/flexibleTemplateParser';
import * as path from 'path';
import * as fs from 'fs';

async function testTemplateFixes() {
  console.log('\n=== Testing Template Fixes ===\n');

  // Correct filename with apostrophe
  const filePath = path.join(
    process.env.HOME || '',
    'Downloads',
    "It's In The Box Logistics Inc of Proper Formatting for Module 1_.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.error('❌ Test file not found:', filePath);
    return;
  }

  // Test 1: Standard parser with improved boolean handling
  console.log('1️⃣  Testing Standard Parser with Boolean Fix...');
  const standardParser = new ExcelTemplateParser();
  
  try {
    const loaded = await standardParser.loadFile(filePath);
    if (!loaded) {
      console.error('   ❌ Failed to load file');
      return;
    }

    const result = standardParser.extractData();
    
    if (result.success) {
      console.log('   ✅ Standard parser succeeded!');
      console.log(`   - Extracted ${Object.keys(result.data || {}).length} fields`);
      console.log(`   - Warnings: ${result.warnings?.length || 0}`);
      
      // Check if boolean fields were parsed correctly
      const recoveryFields = Object.keys(result.data || {}).filter(k => k.startsWith('recovery_'));
      console.log(`   - Recovery fields parsed: ${recoveryFields.length}`);
      
      if (recoveryFields.length > 0) {
        const sample = recoveryFields[0];
        console.log(`   - Sample: ${sample} = ${result.data![sample]}`);
      }
    } else {
      console.log('   ⚠️  Standard parser failed with errors:');
      result.errors?.slice(0, 3).forEach(err => console.log(`      - ${err}`));
      if (result.errors && result.errors.length > 3) {
        console.log(`      ... and ${result.errors.length - 3} more errors`);
      }
    }
  } catch (error) {
    console.error('   ❌ Exception:', error instanceof Error ? error.message : error);
  }

  // Test 2: Flexible parser
  console.log('\n2️⃣  Testing Flexible Parser...');
  const flexibleParser = new FlexibleTemplateParser();
  
  try {
    const loaded = await flexibleParser.loadFile(filePath);
    if (!loaded) {
      console.error('   ❌ Failed to load file');
      return;
    }

    const data = flexibleParser.extractFlexibleData();
    console.log('   ✅ Flexible parser succeeded!');
    console.log(`   - Extracted ${Object.keys(data).length} fields`);
    
    // Show sample data
    console.log('\n   📊 Sample extracted data:');
    
    if (data.filerRemarks) {
      console.log(`   - Filer Remarks: "${data.filerRemarks.substring(0, 50)}..."`);
    }
    
    // Check gross receipts
    const grossReceiptFields = Object.keys(data).filter(k => k.startsWith('gross_'));
    console.log(`   - Gross receipt fields found: ${grossReceiptFields.length}`);
    grossReceiptFields.slice(0, 3).forEach(field => {
      console.log(`     ${field}: ${data[field]}`);
    });
    
    // Check ownership structure
    if (data.ownershipStructure) {
      console.log(`   - Ownership structure: ${JSON.stringify(data.ownershipStructure)}`);
    }
    
  } catch (error) {
    console.error('   ❌ Exception:', error instanceof Error ? error.message : error);
  }

  console.log('\n✅ Test completed!');
}

testTemplateFixes().catch(console.error);