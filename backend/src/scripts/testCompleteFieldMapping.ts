import { ExcelTemplateParser } from '../services/excelTemplateParser';
import { DataTransformer } from '../services/dataTransformer';
import * as path from 'path';
import * as fs from 'fs';

async function testCompleteFieldMapping() {
  console.log('\n=== Testing Complete Field Mapping ===\n');

  const filePath = path.join(
    process.env.HOME || '',
    'Downloads',
    "It's In The Box Logistics Inc of Proper Formatting for Module 1_.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.error('❌ Test file not found:', filePath);
    return;
  }

  console.log('📁 Processing file:', path.basename(filePath));

  // Extract data
  const parser = new ExcelTemplateParser();
  await parser.loadFile(filePath);
  const result = parser.extractData();

  if (!result.success || !result.data) {
    console.error('❌ Failed to extract data');
    return;
  }

  console.log('\n✅ Extraction successful!');
  console.log(`   Total fields extracted: ${Object.keys(result.data).length}`);

  // Transform data
  const transformed = DataTransformer.transform(result.data);

  // Display all extracted data in organized sections
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 COMPLETE EXTRACTED DATA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Company Info
  console.log('1️⃣  COMPANY INFORMATION');
  console.log('   Filer Remarks:', transformed.companyInfo.filerRemarks.substring(0, 50) + '...');
  console.log('   Full-time W2 Employees:');
  console.log('     - 2019:', transformed.companyInfo.fullTimeW2Count2019);
  console.log('     - 2020:', transformed.companyInfo.fullTimeW2Count2020);
  console.log('     - 2021:', transformed.companyInfo.fullTimeW2Count2021);

  // 2. Revenue Reduction Questions
  console.log('\n2️⃣  REVENUE REDUCTION QUESTIONS');
  console.log('   50% reduction in 2020:', transformed.revenueReductionQuestions.reduction50_2020 ? 'Yes' : 'No');
  console.log('   20% reduction in 2021:', transformed.revenueReductionQuestions.reduction20_2021 ? 'Yes' : 'No');
  console.log('   Own other business:', transformed.revenueReductionQuestions.ownOtherBusiness ? 'Yes' : 'No');

  // 3. Shutdown Standards
  console.log('\n3️⃣  SHUTDOWN STANDARDS');
  console.log('   Full Shutdowns:', transformed.shutdownStandards.fullShutdowns ? 'Yes' : 'No');
  console.log('   Partial Shutdowns:', transformed.shutdownStandards.partialShutdowns ? 'Yes' : 'No');
  console.log('   Interrupted Operations:', transformed.shutdownStandards.interruptedOperations ? 'Yes' : 'No');
  console.log('   Supply Chain Interruptions:', transformed.shutdownStandards.supplyChainInterruptions ? 'Yes' : 'No');
  console.log('   Inability to Access Equipment:', transformed.shutdownStandards.inabilityAccessEquipment ? 'Yes' : 'No');
  console.log('   Limited Capacity:', transformed.shutdownStandards.limitedCapacity ? 'Yes' : 'No');
  console.log('   Inability to Work with Vendors:', transformed.shutdownStandards.inabilityWorkVendors ? 'Yes' : 'No');
  console.log('   Reduction in Services:', transformed.shutdownStandards.reductionServices ? 'Yes' : 'No');
  console.log('   Cut Down Hours:', transformed.shutdownStandards.cutDownHours ? 'Yes' : 'No');
  console.log('   Shifting Hours for Sanitation:', transformed.shutdownStandards.shiftingHoursSanitation ? 'Yes' : 'No');
  console.log('   Challenges Finding Employees:', transformed.shutdownStandards.challengesFindingEmployees ? 'Yes' : 'No');
  console.log('   Other Comments:', transformed.shutdownStandards.otherComments.substring(0, 50) + '...');

  // 4. Gross Receipts
  console.log('\n4️⃣  GROSS RECEIPTS (Business Sales)');
  console.log('   2019:');
  console.log(`     Q1: $${transformed.grossReceipts[2019].Q1.toLocaleString()}`);
  console.log(`     Q2: $${transformed.grossReceipts[2019].Q2.toLocaleString()}`);
  console.log(`     Q3: $${transformed.grossReceipts[2019].Q3.toLocaleString()}`);
  console.log(`     Q4: $${transformed.grossReceipts[2019].Q4.toLocaleString()}`);
  console.log(`     Total: $${(transformed.grossReceipts[2019].Q1 + transformed.grossReceipts[2019].Q2 + transformed.grossReceipts[2019].Q3 + transformed.grossReceipts[2019].Q4).toLocaleString()}`);
  
  console.log('   2020:');
  console.log(`     Q1: $${transformed.grossReceipts[2020].Q1.toLocaleString()}`);
  console.log(`     Q2: $${transformed.grossReceipts[2020].Q2.toLocaleString()}`);
  console.log(`     Q3: $${transformed.grossReceipts[2020].Q3.toLocaleString()}`);
  console.log(`     Q4: $${transformed.grossReceipts[2020].Q4.toLocaleString()}`);
  console.log(`     Total: $${(transformed.grossReceipts[2020].Q1 + transformed.grossReceipts[2020].Q2 + transformed.grossReceipts[2020].Q3 + transformed.grossReceipts[2020].Q4).toLocaleString()}`);
  
  console.log('   2021:');
  console.log(`     Q1: $${transformed.grossReceipts[2021].Q1.toLocaleString()}`);
  console.log(`     Q2: $${transformed.grossReceipts[2021].Q2.toLocaleString()}`);
  console.log(`     Q3: $${transformed.grossReceipts[2021].Q3.toLocaleString()}`);
  console.log(`     Q4: $${transformed.grossReceipts[2021].Q4.toLocaleString()}`);
  console.log(`     Total: $${(transformed.grossReceipts[2021].Q1 + transformed.grossReceipts[2021].Q2 + transformed.grossReceipts[2021].Q3 + transformed.grossReceipts[2021].Q4).toLocaleString()}`);

  // 5. PPP Information
  console.log('\n5️⃣  PPP INFORMATION');
  console.log(`   PPP1 Forgiveness Amount: $${transformed.pppInformation.ppp1ForgivenessAmount.toLocaleString()}`);
  console.log(`   PPP2 Forgiveness Amount: $${transformed.pppInformation.ppp2ForgivenessAmount.toLocaleString()}`);

  // 6. Ownership Structure
  console.log('\n6️⃣  OWNERSHIP STRUCTURE');
  console.log('   Owner Name:', transformed.ownershipStructure.ownerName);
  console.log('   Ownership Percentage:', transformed.ownershipStructure.ownerPercentage);

  // 7. Qualifying Questions Sample (Q1 2020)
  console.log('\n7️⃣  QUALIFYING QUESTIONS (Q1 2020 Sample)');
  const q1_2020 = transformed.qualifyingQuestions[2020].Q1;
  console.log('   Government Shutdown:', q1_2020.governmentShutdown ? 'Yes' : 'No');
  console.log('   Inability to Meet Face-to-Face:', q1_2020.inabilityToMeet ? 'Yes' : 'No');
  console.log('   Supply Chain Disruptions:', q1_2020.supplyDisruptions ? 'Yes' : 'No');
  console.log('   Vendor/Supplier Disruptions:', q1_2020.vendorDisruptions ? 'Yes' : 'No');
  console.log('   Recovery Startup Business:', q1_2020.recoveryStartupBusiness ? 'Yes' : 'No');

  // 8. Calculate gross receipts decline
  console.log('\n8️⃣  GROSS RECEIPTS DECLINE ANALYSIS');
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
    const q2019 = transformed.grossReceipts[2019][q as keyof typeof transformed.grossReceipts[2019]];
    const q2020 = transformed.grossReceipts[2020][q as keyof typeof transformed.grossReceipts[2020]];
    const q2021 = transformed.grossReceipts[2021][q as keyof typeof transformed.grossReceipts[2021]];
    
    const decline2020 = q2019 > 0 ? ((q2019 - q2020) / q2019 * 100) : 0;
    const decline2021 = q2019 > 0 ? ((q2019 - q2021) / q2019 * 100) : 0;
    
    console.log(`   ${q}:`);
    console.log(`     2020 vs 2019: ${decline2020 > 0 ? '-' : '+'}${Math.abs(decline2020).toFixed(1)}%`);
    console.log(`     2021 vs 2019: ${decline2021 > 0 ? '-' : '+'}${Math.abs(decline2021).toFixed(1)}%`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Field mapping test completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Show raw data for debugging
  if (result.warnings && result.warnings.length > 0) {
    console.log('⚠️  Extraction Warnings:');
    result.warnings.forEach(w => console.log(`   - ${w}`));
  }
}

testCompleteFieldMapping().catch(console.error);