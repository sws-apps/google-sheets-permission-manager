import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

async function examineExcelStructure() {
  console.log('\n=== Examining Excel File Structure ===\n');

  const filePath = path.join(
    process.env.HOME || '',
    'Downloads',
    'Its In The Box Logistics Inc of Proper Formatting for Module 1_.xlsx'
  );

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  try {
    const workbook = XLSX.readFile(filePath);
    
    console.log('📁 Workbook Information:');
    console.log(`   Sheet Names: ${workbook.SheetNames.join(', ')}`);
    console.log('');

    // Check each sheet
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n📊 Sheet: "${sheetName}"`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Get sheet range
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      console.log(`   Range: ${worksheet['!ref']}`);
      console.log(`   Rows: ${range.e.r + 1}, Columns: ${range.e.c + 1}`);
      
      // Check specific cells that are causing errors
      console.log('\n   🔍 Checking problematic cells:');
      
      const cellsToCheck = [
        // Recovery startup business questions
        { cell: 'B13', expected: 'BOOLEAN', description: 'Recovery startup Q1 2020' },
        { cell: 'C13', expected: 'BOOLEAN', description: 'Recovery startup Q2 2020' },
        { cell: 'D13', expected: 'BOOLEAN', description: 'Recovery startup Q3 2020' },
        { cell: 'E13', expected: 'BOOLEAN', description: 'Recovery startup Q4 2020' },
        
        // Gross receipts
        { cell: 'B31', expected: 'NUMBER', description: 'Gross receipts 2019 Q1' },
        { cell: 'B32', expected: 'NUMBER', description: 'Gross receipts 2019 Q2' },
        { cell: 'B47', expected: 'NUMBER', description: 'Gross receipts 2021 Q3' },
        
        // Form 941 data
        { cell: 'B63', expected: 'NUMBER', description: 'Form 941 2020 Q1 employees' },
        { cell: 'B65', expected: 'NUMBER', description: 'Form 941 2020 Q3 employees' },
        { cell: 'B71', expected: 'NUMBER', description: 'Form 941 2021 Q1 employees' },
        
        // Also check question cells
        { cell: 'A13', expected: 'TEXT', description: 'Recovery startup question text' },
        { cell: 'A31', expected: 'TEXT', description: 'Q1 label' },
        { cell: 'A63', expected: 'TEXT', description: 'Q1 label for Form 941' }
      ];
      
      cellsToCheck.forEach(({ cell, expected, description }) => {
        const cellData = worksheet[cell];
        if (cellData) {
          console.log(`   ${cell} (${description}):`);
          console.log(`      Type: ${cellData.t} (s=string, n=number, b=boolean)`);
          console.log(`      Value: "${cellData.v}"`);
          console.log(`      Expected: ${expected}`);
          if (cellData.f) {
            console.log(`      Formula: ${cellData.f}`);
          }
        } else {
          console.log(`   ${cell} (${description}): EMPTY`);
        }
      });
      
      // Check rows 8-14 (qualifying questions area)
      console.log('\n   📋 Qualifying Questions Area (Rows 8-14):');
      for (let row = 8; row <= 14; row++) {
        const cellA = worksheet[`A${row}`];
        const cellB = worksheet[`B${row}`];
        if (cellA || cellB) {
          console.log(`   Row ${row}:`);
          if (cellA) console.log(`      A${row}: "${cellA.v}"`);
          if (cellB) console.log(`      B${row}: "${cellB.v}" (type: ${cellB.t})`);
        }
      }
      
      // Check rows 30-34 (gross receipts 2019)
      console.log('\n   💰 Gross Receipts 2019 Area (Rows 30-34):');
      for (let row = 30; row <= 34; row++) {
        const cellA = worksheet[`A${row}`];
        const cellB = worksheet[`B${row}`];
        if (cellA || cellB) {
          console.log(`   Row ${row}:`);
          if (cellA) console.log(`      A${row}: "${cellA.v}"`);
          if (cellB) console.log(`      B${row}: "${cellB.v}" (type: ${cellB.t})`);
        }
      }
      
      // Check rows 61-66 (Form 941 2020)
      console.log('\n   📄 Form 941 2020 Area (Rows 61-66):');
      for (let row = 61; row <= 66; row++) {
        const cellA = worksheet[`A${row}`];
        const cellB = worksheet[`B${row}`];
        if (cellA || cellB) {
          console.log(`   Row ${row}:`);
          if (cellA) console.log(`      A${row}: "${cellA.v}"`);
          if (cellB) console.log(`      B${row}: "${cellB.v}" (type: ${cellB.t})`);
        }
      }
    });

    // Export first 100 rows to see the structure
    console.log('\n\n📝 First 20 rows of data (all columns):');
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
    
    jsonData.slice(0, 20).forEach((row: any, index: number) => {
      console.log(`Row ${index + 1}: ${JSON.stringify(row)}`);
    });

  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

examineExcelStructure().catch(console.error);