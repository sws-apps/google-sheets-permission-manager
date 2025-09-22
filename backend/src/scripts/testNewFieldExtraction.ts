import { ExcelTemplateParser } from '../services/excelTemplateParser';
import { DataTransformer } from '../services/dataTransformer';
import * as path from 'path';
import * as fs from 'fs';

async function testNewFieldExtraction() {
  console.log('\n=== Testing Complete Field Extraction with Multi-Sheet Support ===\n');

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

  try {
    // Extract data
    const parser = new ExcelTemplateParser();
    const loaded = await parser.loadFile(filePath);
    
    if (!loaded) {
      console.error('❌ Failed to load file');
      return;
    }

    const result = parser.extractData();

    if (!result.success || !result.data) {
      console.error('❌ Failed to extract data:', result.errors);
      return;
    }

    console.log('\n✅ Extraction successful!');
    console.log(`   Total fields extracted: ${Object.keys(result.data).length}`);
    console.log(`   Warnings: ${result.warnings?.length || 0}`);

    // Check new fields from Data Dump sheet
    console.log('\n🔍 Checking Company Basic Info (from Data Dump sheet):');
    const companyFields = ['companyEIN', 'companyName', 'tradeName', 'addressLine1', 'addressCity', 'addressState', 'addressZip'];
    let companyFieldsFound = 0;
    companyFields.forEach(field => {
      if (result.data![field] !== undefined) {
        console.log(`   ✅ ${field}: ${result.data![field]}`);
        companyFieldsFound++;
      } else {
        console.log(`   ❌ ${field}: NOT FOUND`);
      }
    });

    // Check new fields from 941 form sheet
    console.log('\n🔍 Checking 941 Form Data (from 941 form sheet):');
    const form941Fields = [
      'employeeCount_q1_2020', 'employeeCount_q2_2020', 'employeeCount_q3_2020', 'employeeCount_q4_2020',
      'employeeCount_q1_2021', 'employeeCount_q2_2021', 'employeeCount_q3_2021',
      'taxableSocSecWages_q1_2020', 'taxableSocSecWages_q2_2020', 'taxableSocSecWages_q3_2020', 'taxableSocSecWages_q4_2020',
      'taxableSocSecWages_q1_2021', 'taxableSocSecWages_q2_2021', 'taxableSocSecWages_q3_2021'
    ];
    let form941FieldsFound = 0;
    form941Fields.forEach(field => {
      if (result.data![field] !== undefined) {
        console.log(`   ✅ ${field}: ${result.data![field]}`);
        form941FieldsFound++;
      } else {
        console.log(`   ❌ ${field}: NOT FOUND`);
      }
    });

    // Transform data
    console.log('\n🔄 Transforming data...');
    const transformed = DataTransformer.transform(result.data);

    // Verify transformed company info
    console.log('\n📊 Transformed Company Info:');
    console.log(`   EIN: ${transformed.companyInfo.ein}`);
    console.log(`   Legal Name: ${transformed.companyInfo.legalName}`);
    console.log(`   Trade Name: ${transformed.companyInfo.tradeName}`);
    console.log(`   Address: ${transformed.companyInfo.address.line1}, ${transformed.companyInfo.address.city}, ${transformed.companyInfo.address.state} ${transformed.companyInfo.address.zip}`);

    // Verify quarterly data
    console.log('\n📊 Quarterly Employee Counts (from 941):');
    [2020, 2021].forEach(year => {
      const yearData = transformed.quarterlyEmployeeCounts[year as 2020 | 2021];
      console.log(`   ${year}: Q1=${yearData.Q1}, Q2=${yearData.Q2}, Q3=${yearData.Q3}, Q4=${yearData.Q4}`);
    });

    console.log('\n📊 Quarterly Taxable Wages (from 941):');
    [2020, 2021].forEach(year => {
      const yearData = transformed.quarterlyTaxableWages[year as 2020 | 2021];
      console.log(`   ${year}: Q1=$${yearData.Q1.toLocaleString()}, Q2=$${yearData.Q2.toLocaleString()}, Q3=$${yearData.Q3.toLocaleString()}, Q4=$${yearData.Q4.toLocaleString()}`);
    });

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 EXTRACTION SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total fields extracted: ${Object.keys(result.data).length}`);
    console.log(`Company fields from Data Dump: ${companyFieldsFound}/${companyFields.length}`);
    console.log(`941 form fields: ${form941FieldsFound}/${form941Fields.length}`);
    console.log(`Expected total: ~100+ fields`);
    
    if (Object.keys(result.data).length > 90) {
      console.log('\n✅ SUCCESS: Extracting 90+ fields as expected!');
    } else {
      console.log('\n⚠️  WARNING: Expected more fields. Check configuration.');
    }

    // Show warnings if any
    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
      if (result.warnings.length > 10) {
        console.log(`   ... and ${result.warnings.length - 10} more warnings`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNewFieldExtraction().catch(console.error);