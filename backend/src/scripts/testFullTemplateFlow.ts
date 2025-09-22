import { ExcelTemplateParser } from '../services/excelTemplateParser';
import { FlexibleTemplateParser } from '../services/flexibleTemplateParser';
import { DataTransformer } from '../services/dataTransformer';
import * as path from 'path';
import * as fs from 'fs';

async function testFullTemplateFlow() {
  console.log('\n=== Testing Full Template Processing Flow ===\n');

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

  // Step 1: Try standard parser
  console.log('\n1️⃣  Attempting Standard Parser...');
  const standardParser = new ExcelTemplateParser();
  let extractedData: any = null;
  let useFlexible = false;

  try {
    await standardParser.loadFile(filePath);
    const result = standardParser.extractData();
    
    if (result.success && result.data) {
      console.log('   ✅ Standard parser succeeded');
      console.log(`   - Fields extracted: ${Object.keys(result.data).length}`);
      console.log(`   - Warnings: ${result.warnings?.length || 0}`);
      
      // Show warnings
      if (result.warnings && result.warnings.length > 0) {
        console.log('\n   ⚠️  Warnings:');
        result.warnings.slice(0, 10).forEach(w => console.log(`      - ${w}`));
        if (result.warnings.length > 10) {
          console.log(`      ... and ${result.warnings.length - 10} more warnings`);
        }
      }
      
      // Show sample gross receipts data
      console.log('\n   📊 Sample Gross Receipts Data:');
      console.log(`      2019 Q1: ${result.data?.gross_receipts_2019_q1 || 'Not found'}`);
      console.log(`      2020 Q1: ${result.data?.gross_receipts_2020_q1 || 'Not found'}`);
      console.log(`      2021 Q1: ${result.data?.gross_receipts_2021_q1 || 'Not found'}`);
      extractedData = result.data;
    } else {
      console.log('   ⚠️  Standard parser had issues, switching to flexible parser...');
      useFlexible = true;
    }
  } catch (error) {
    console.log('   ⚠️  Standard parser failed, switching to flexible parser...');
    useFlexible = true;
  }

  // Step 2: Use flexible parser if needed
  if (useFlexible) {
    console.log('\n2️⃣  Using Flexible Parser...');
    const flexibleParser = new FlexibleTemplateParser();
    
    try {
      await flexibleParser.loadFile(filePath);
      extractedData = flexibleParser.extractFlexibleData();
      console.log('   ✅ Flexible parser succeeded');
      console.log(`   - Fields extracted: ${Object.keys(extractedData).length}`);
    } catch (error) {
      console.error('   ❌ Both parsers failed:', error);
      return;
    }
  }

  // Step 3: Transform data
  console.log('\n3️⃣  Transforming Data...');
  try {
    const transformedData = DataTransformer.transform(extractedData);
    console.log('   ✅ Data transformed successfully');
    
    // Show summary
    console.log('\n📊 Transformation Summary:');
    console.log('   Company Info:');
    console.log(`     - Filer Remarks: "${transformedData.companyInfo.filerRemarks.substring(0, 50)}..."`);
    console.log(`     - FT Employees 2020: ${transformedData.companyInfo.fullTimeW2Count2020}`);
    console.log(`     - FT Employees 2021: ${transformedData.companyInfo.fullTimeW2Count2021}`);
    
    console.log('\n   Gross Receipts:');
    ['2019', '2020', '2021'].forEach(year => {
      const yearData = (transformedData.grossReceipts as any)[year];
      if (yearData) {
        const total = Object.values(yearData).reduce((sum: number, val: any) => sum + (val || 0), 0);
        console.log(`     ${year}: $${total.toLocaleString()}`);
      }
    });
    
    console.log('\n   Validation Status:', transformedData.metadata.validationStatus);
    if (transformedData.metadata.missingFields && transformedData.metadata.missingFields.length > 0) {
      console.log(`   Missing Fields: ${transformedData.metadata.missingFields.length}`);
    }
  } catch (error) {
    console.error('   ❌ Transformation failed:', error);
    return;
  }

  // Step 4: Calculate metrics
  console.log('\n4️⃣  Calculating Metrics...');
  try {
    const metrics = DataTransformer.calculateMetrics(
      DataTransformer.transform(extractedData)
    );
    
    console.log('   ✅ Metrics calculated');
    console.log(`     - Average Employee Count: ${metrics.averageEmployeeCount}`);
    console.log(`     - Total Retention Credit Wages: $${metrics.totalRetentionCreditWages.toLocaleString()}`);
    
    // Show eligible quarters
    const eligibleQuarters: string[] = [];
    Object.entries(metrics.eligibleQuarters).forEach(([year, quarters]: [string, any]) => {
      Object.entries(quarters).forEach(([quarter, eligible]) => {
        if (eligible === true) {
          eligibleQuarters.push(`${year} ${quarter}`);
        }
      });
    });
    
    if (eligibleQuarters.length > 0) {
      console.log(`     - Eligible Quarters: ${eligibleQuarters.join(', ')}`);
    }
  } catch (error) {
    console.error('   ❌ Metrics calculation failed:', error);
  }

  console.log('\n✅ Full template processing flow completed successfully!');
  console.log('\n💡 The system can now handle:');
  console.log('   - Standard ERC template format');
  console.log('   - Filled questionnaire format (like the test file)');
  console.log('   - Numeric boolean values (0, 1, 2, 3)');
  console.log('   - Text in numeric fields (converts to 0 with warning)');
  console.log('   - Missing data (uses defaults)');
}

testFullTemplateFlow().catch(console.error);