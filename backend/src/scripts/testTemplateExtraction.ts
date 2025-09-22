import { ExcelTemplateParser } from '../services/excelTemplateParser';
import { DataTransformer } from '../services/dataTransformer';
import * as path from 'path';
import * as fs from 'fs';

async function testTemplateExtraction() {
  console.log('\n=== Testing Excel Template Extraction ===\n');

  // Test file path - update this to the actual file path
  const testFilePath = path.join(
    process.env.HOME || '',
    'Downloads',
    'Its In The Box Logistics Inc of Proper Formatting for Module 1_.xlsx'
  );

  console.log(`Looking for test file at: ${testFilePath}`);

  if (!fs.existsSync(testFilePath)) {
    console.error('❌ Test file not found. Please ensure the file exists at the specified path.');
    console.log('\nAlternatively, you can test with sample data...\n');
    return testWithSampleData();
  }

  const parser = new ExcelTemplateParser();

  try {
    console.log('📁 Loading Excel file...');
    const loaded = await parser.loadFile(testFilePath);
    
    if (!loaded) {
      console.error('❌ Failed to load file');
      return;
    }

    console.log('✅ File loaded successfully\n');

    console.log('📊 Extracting data...');
    const extractionResult = parser.extractData();

    if (!extractionResult.success) {
      console.error('❌ Extraction failed:', extractionResult.errors);
      return;
    }

    console.log('✅ Data extracted successfully\n');

    // Show warnings if any
    if (extractionResult.warnings && extractionResult.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      extractionResult.warnings.forEach(w => console.log(`   - ${w}`));
      console.log('');
    }

    // Validate data
    const validation = parser.validateData(extractionResult.data!);
    console.log('📋 Validation Results:');
    console.log(`   - Valid: ${validation.isValid}`);
    console.log(`   - Missing fields: ${validation.missingFields.length}`);
    console.log(`   - Invalid fields: ${validation.invalidFields.length}`);

    if (validation.missingFields.length > 0) {
      console.log('\n   Missing fields:');
      validation.missingFields.slice(0, 5).forEach(f => console.log(`   - ${f}`));
      if (validation.missingFields.length > 5) {
        console.log(`   ... and ${validation.missingFields.length - 5} more`);
      }
    }

    // Transform data
    console.log('\n🔄 Transforming data...');
    const transformedData = DataTransformer.transform(extractionResult.data!);
    console.log('✅ Data transformed successfully\n');

    // Calculate metrics
    const metrics = DataTransformer.calculateMetrics(transformedData);

    // Display summary
    console.log('📊 Summary:');
    console.log('\n1️⃣  Company Information:');
    console.log(`   - Filer Remarks: ${transformedData.companyInfo.filerRemarks}`);
    console.log(`   - FT W2 Count 2020: ${transformedData.companyInfo.fullTimeW2Count2020}`);
    console.log(`   - FT W2 Count 2021: ${transformedData.companyInfo.fullTimeW2Count2021}`);

    console.log('\n2️⃣  Gross Receipts:');
    Object.entries(transformedData.grossReceipts).forEach(([year, quarters]: [string, any]) => {
      const total = Object.values(quarters).reduce((sum: number, val: any) => sum + (val || 0), 0);
      console.log(`   ${year}: $${total.toLocaleString()} (Q1: $${quarters.Q1?.toLocaleString() || 0})`);
    });

    console.log('\n3️⃣  Metrics:');
    console.log(`   - Average Employee Count: ${metrics.averageEmployeeCount}`);
    console.log(`   - Total Retention Credit Wages: $${metrics.totalRetentionCreditWages.toLocaleString()}`);

    console.log('\n4️⃣  Gross Receipts Decline (2020 vs 2019):');
    Object.entries(metrics.grossReceiptsDecline[2020] || {}).forEach(([quarter, decline]: [string, any]) => {
      console.log(`   ${quarter}: ${decline.toFixed(1)}%`);
    });

    console.log('\n5️⃣  Eligible Quarters:');
    Object.entries(metrics.eligibleQuarters).forEach(([year, quarters]: [string, any]) => {
      const eligible = Object.entries(quarters)
        .filter(([q, isEligible]) => isEligible)
        .map(([q]) => q);
      if (eligible.length > 0) {
        console.log(`   ${year}: ${eligible.join(', ')}`);
      }
    });

    console.log('\n✅ Template extraction test completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Test with sample data if file not found
async function testWithSampleData() {
  console.log('📝 Testing with sample extracted data...\n');

  const sampleData = {
    filerRemarks: 'Sample test data',
    fullTimeW2Count2020: 35,
    fullTimeW2Count2021: 40,
    // Gross receipts
    gross_2019_q1: 1005325,
    gross_2019_q2: 786256,
    gross_2019_q3: 856236,
    gross_2019_q4: 1125253,
    gross_2020_q1: 758562,
    gross_2020_q2: 235826,
    gross_2020_q3: 358232,
    gross_2020_q4: 658126,
    gross_2021_q1: 758256,
    gross_2021_q2: 825698,
    gross_2021_q3: 1125862,
    gross_2021_q4: 1358965,
    // Qualifying questions
    shutdown_q1_2020: true,
    shutdown_q2_2020: true,
    shutdown_q3_2020: true,
    shutdown_q4_2020: true,
    reduction20_q2_2020: true,
    reduction20_q3_2020: true,
    // Form 941 data
    form941_2020_q3_employees: 32,
    form941_2020_q3_wages: 398250,
    form941_2020_q3_retentionWages: 85632,
    form941_2020_q4_employees: 36,
    form941_2020_q4_wages: 456253,
    form941_2020_q4_retentionWages: 120256,
    form941_2021_q1_employees: 35,
    form941_2021_q1_wages: 450256,
    form941_2021_q1_retentionWages: 115263,
    form941_2021_q2_employees: 37,
    form941_2021_q2_wages: 485625,
    form941_2021_q2_retentionWages: 125632,
    form941_2021_q3_employees: 40,
    form941_2021_q3_wages: 512563,
    form941_2021_q3_retentionWages: 135265
  };

  const transformedData = DataTransformer.transform(sampleData);
  const metrics = DataTransformer.calculateMetrics(transformedData);

  console.log('✅ Sample data transformed successfully');
  console.log('\n📊 Metrics from sample data:');
  console.log(`   - Average Employee Count: ${metrics.averageEmployeeCount}`);
  console.log(`   - Total Retention Credit Wages: $${metrics.totalRetentionCreditWages.toLocaleString()}`);
  
  console.log('\n   Gross Receipts Decline (Q2 2020): ${(metrics.grossReceiptsDecline[2020]?.Q2 || 0).toFixed(1)}%');
}

// Run the test
testTemplateExtraction().catch(console.error);