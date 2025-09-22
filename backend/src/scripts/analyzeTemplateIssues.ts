import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { ERC_TEMPLATE_CONFIG } from '../config/ercTemplateConfig';

async function analyzeTemplateIssues() {
  console.log('\n=== Analyzing Template Issues ===\n');

  // Correct filename with apostrophe
  const filePath = path.join(
    process.env.HOME || '',
    'Downloads',
    "It's In The Box Logistics Inc of Proper Formatting for Module 1_.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  try {
    const workbook = XLSX.readFile(filePath);
    
    console.log('📁 Workbook Information:');
    console.log(`   Available Sheets: ${workbook.SheetNames.join(', ')}`);
    console.log(`   Expected Sheet: ${ERC_TEMPLATE_CONFIG.sheets.main}`);
    
    // Check if expected sheet exists
    const expectedSheetName = ERC_TEMPLATE_CONFIG.sheets.main;
    if (!workbook.SheetNames.includes(expectedSheetName)) {
      console.error(`\n❌ Expected sheet "${expectedSheetName}" not found!`);
      console.log('   Available sheets:', workbook.SheetNames);
      return;
    }

    const worksheet = workbook.Sheets[expectedSheetName];
    console.log(`\n✅ Found sheet: "${expectedSheetName}"`);

    // Analyze error cells from the logs
    const errorCells = [
      { cell: 'B13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'C13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'D13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'E13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'F13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'G13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'H13', issue: 'Cannot parse "3" as boolean', section: 'Recovery startup business' },
      { cell: 'B31', issue: 'Cannot parse "Yes" as number', section: 'Gross receipts 2019 Q1' },
      { cell: 'B32', issue: 'Cannot parse "Businesses were closed..." as number', section: 'Gross receipts 2019 Q2' },
      { cell: 'B47', issue: 'Cannot parse "Quarter 1" as number', section: 'Gross receipts 2021 Q3' },
      { cell: 'B63', issue: 'Cannot parse "Percentages" as number', section: 'Form 941 2020 Q1 employees' }
    ];

    console.log('\n🔍 Analyzing Error Cells:');
    errorCells.forEach(({ cell, issue, section }) => {
      const cellData = worksheet[cell];
      console.log(`\n   ${cell} (${section}):`);
      console.log(`   Error: ${issue}`);
      if (cellData) {
        console.log(`   Actual value: "${cellData.v}"`);
        console.log(`   Type in Excel: ${cellData.t} (s=string, n=number, b=boolean)`);
      } else {
        console.log(`   Cell is EMPTY`);
      }
    });

    // Check the structure around key areas
    console.log('\n\n📋 Analyzing Key Areas:');
    
    // 1. Qualifying Questions Area (Rows 8-14)
    console.log('\n1️⃣  Qualifying Questions (Rows 8-14, Columns A-H):');
    for (let row = 8; row <= 14; row++) {
      console.log(`\n   Row ${row}:`);
      for (let col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
        const cell = worksheet[`${col}${row}`];
        if (cell) {
          const value = cell.v.toString();
          const preview = value.length > 40 ? value.substring(0, 40) + '...' : value;
          console.log(`     ${col}${row}: "${preview}" (type: ${cell.t})`);
        }
      }
    }

    // 2. Gross Receipts Area (Rows 30-48)
    console.log('\n2️⃣  Gross Receipts Area (Rows 30-48, Columns A-B):');
    for (let row = 30; row <= 48; row += 2) {
      const cellA = worksheet[`A${row}`];
      const cellB = worksheet[`B${row}`];
      if (cellA || cellB) {
        console.log(`   Row ${row}:`);
        if (cellA) console.log(`     A${row}: "${cellA.v}"`);
        if (cellB) console.log(`     B${row}: "${cellB.v}" (type: ${cellB.t})`);
      }
    }

    // 3. Form 941 Area (Rows 61-74)
    console.log('\n3️⃣  Form 941 Area (Rows 61-74, Columns A-B):');
    for (let row = 61; row <= 74; row++) {
      const cellA = worksheet[`A${row}`];
      const cellB = worksheet[`B${row}`];
      if (cellA || cellB) {
        console.log(`   Row ${row}:`);
        if (cellA) console.log(`     A${row}: "${cellA.v}"`);
        if (cellB) console.log(`     B${row}: "${cellB.v}" (type: ${cellB.t})`);
      }
    }

    // Export data as JSON to analyze structure
    console.log('\n\n📄 Exporting first 20 rows as JSON for analysis...');
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '',
      raw: false 
    });
    
    // Save to file for inspection
    const outputPath = path.join(__dirname, 'template-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData.slice(0, 100), null, 2));
    console.log(`   Saved to: ${outputPath}`);

    // Analyze patterns
    console.log('\n\n🔍 Pattern Analysis:');
    console.log('1. Recovery startup business (Row 13) has numeric values (3) instead of boolean');
    console.log('2. Gross receipts cells contain text answers instead of numeric values');
    console.log('3. Form 941 employee count cells contain text ("Percentages") instead of numbers');
    console.log('\nThis suggests the uploaded file might be:');
    console.log('- A filled questionnaire/form rather than data template');
    console.log('- Using different value conventions (numbers for yes/no questions)');
    console.log('- Contains explanatory text in data cells');

  } catch (error) {
    console.error('Error analyzing Excel file:', error);
  }
}

analyzeTemplateIssues().catch(console.error);