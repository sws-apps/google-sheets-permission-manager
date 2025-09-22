import * as XLSX from 'xlsx';
import { ExcelTemplateParser, ExtractedData } from './excelTemplateParser';
import { ERC_TEMPLATE_CONFIG } from '../config/ercTemplateConfig';

interface CellLocation {
  row: number;
  col: string;
  address: string;
}

export class FlexibleTemplateParser extends ExcelTemplateParser {
  private cellCache: Map<string, any> = new Map();
  
  /**
   * Find a cell containing specific text
   */
  protected findCellByText(searchText: string, partial: boolean = true): CellLocation | null {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) return null;
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1000');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
          const cellText = String(cell.v).toLowerCase();
          const search = searchText.toLowerCase();
          
          if (partial ? cellText.includes(search) : cellText === search) {
            return {
              row: row + 1, // Convert to 1-based
              col: XLSX.utils.encode_col(col),
              address: cellAddress
            };
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get value from a cell relative to a found location
   */
  protected getRelativeCell(location: CellLocation, rowOffset: number, colOffset: number): any {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) return null;
    
    const colNum = XLSX.utils.decode_col(location.col);
    const newCol = XLSX.utils.encode_col(colNum + colOffset);
    const newRow = location.row + rowOffset;
    const cellAddress = `${newCol}${newRow}`;
    
    return worksheet[cellAddress]?.v;
  }
  
  /**
   * Extract data with flexible cell finding
   */
  extractFlexibleData(): ExtractedData {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) {
      throw new Error('No worksheet loaded');
    }
    
    const data: ExtractedData = {};
    
    // Extract company info
    this.extractCompanyInfo(data);
    
    // Extract qualifying questions
    this.extractQualifyingQuestions(data);
    
    // Extract gross receipts
    this.extractGrossReceipts(data);
    
    // Extract ownership structure (instead of Form 941)
    this.extractOwnershipStructure(data);
    
    return data;
  }
  
  private extractCompanyInfo(data: ExtractedData) {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) return;
    
    // Filer remarks - usually at the top
    const remarksCell = worksheet['A2'];
    if (remarksCell) {
      data.filerRemarks = String(remarksCell.v || '');
    }
    
    // Look for W-2 count information
    const w2Label = this.findCellByText('Number of full-time W-2');
    if (w2Label) {
      data.fullTimeW2Count2020 = this.parseNumberSafe(this.getRelativeCell(w2Label, 1, 0));
      data.fullTimeW2Count2021 = this.parseNumberSafe(this.getRelativeCell(w2Label, 1, 1));
    }
  }
  
  private extractQualifyingQuestions(data: ExtractedData) {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) return;
    
    // Find the qualifying questions section
    const questionsHeader = this.findCellByText('Qualifiying questions') || 
                           this.findCellByText('Qualifying questions');
    
    if (!questionsHeader) return;
    
    // Questions are in rows below, answers in columns B-H
    const questions = [
      { pattern: 'partial or full government shutdown', prefix: 'shutdown' },
      { pattern: 'supply chain', prefix: 'supply' },
      { pattern: '10% reduction', prefix: 'reduction10' },
      { pattern: '20% reduction', prefix: 'reduction20' },
      { pattern: 'Recovery Startup', prefix: 'recovery' },
      { pattern: 'severely distressed', prefix: 'distressed' }
    ];
    
    const quarters = [
      { col: 'B', quarter: 'q1', year: '2020' },
      { col: 'C', quarter: 'q2', year: '2020' },
      { col: 'D', quarter: 'q3', year: '2020' },
      { col: 'E', quarter: 'q4', year: '2020' },
      { col: 'F', quarter: 'q1', year: '2021' },
      { col: 'G', quarter: 'q2', year: '2021' },
      { col: 'H', quarter: 'q3', year: '2021' }
    ];
    
    // Search for each question type
    questions.forEach(({ pattern, prefix }) => {
      const questionCell = this.findCellByText(pattern);
      if (questionCell) {
        quarters.forEach(({ col, quarter, year }) => {
          const cellAddress = `${col}${questionCell.row}`;
          const value = worksheet?.[cellAddress]?.v;
          data[`${prefix}_${quarter}_${year}`] = this.parseBooleanSafe(value);
        });
      }
    });
    
    // Handle the special case of row 13 with numeric values
    if (worksheet) {
      quarters.forEach(({ col, quarter, year }) => {
        const cellAddress = `${col}13`;
        const value = worksheet?.[cellAddress]?.v;
        if (value !== undefined && !data[`recovery_${quarter}_${year}`]) {
          data[`recovery_${quarter}_${year}`] = this.parseBooleanSafe(value);
        }
      });
    }
  }
  
  private extractGrossReceipts(data: ExtractedData) {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) return;
    
    // Look for "Business Gross Sales" entries
    const range = XLSX.utils.decode_range(worksheet?.['!ref'] || 'A1:Z1000');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellA = worksheet?.[`A${row + 1}`];
      const cellB = worksheet?.[`B${row + 1}`];
      
      if (cellA?.v && String(cellA.v).includes('Business Gross Sales') && cellB?.v) {
        // Found gross sales entry, now determine which quarter/year
        // Look for quarter/year info in nearby cells
        for (let checkRow = row - 5; checkRow <= row + 5; checkRow++) {
          const checkCell = worksheet?.[`B${checkRow + 1}`];
          if (checkCell?.v) {
            const cellValue = String(checkCell.v);
            
            // Check for year
            if (cellValue.includes('2019') || cellValue === '2019') {
              this.assignGrossReceiptsByContext(data, row, '2019', cellB.v);
            } else if (cellValue.includes('2020') || cellValue === '2020') {
              this.assignGrossReceiptsByContext(data, row, '2020', cellB.v);
            } else if (cellValue.includes('2021') || cellValue === '2021') {
              this.assignGrossReceiptsByContext(data, row, '2021', cellB.v);
            }
          }
        }
      }
    }
  }
  
  private assignGrossReceiptsByContext(data: ExtractedData, row: number, year: string, value: any) {
    const worksheet = this.worksheets[ERC_TEMPLATE_CONFIG.sheets.main];
    if (!worksheet) return;
    
    // Look for quarter information nearby
    for (let checkRow = row - 3; checkRow <= row + 3; checkRow++) {
      const checkCell = worksheet?.[`B${checkRow + 1}`];
      if (checkCell?.v) {
        const cellValue = String(checkCell.v).toLowerCase();
        
        if (cellValue.includes('quarter 1') || cellValue.includes('q1')) {
          data[`gross_${year}_q1`] = this.parseNumberSafe(value);
        } else if (cellValue.includes('quarter 2') || cellValue.includes('q2')) {
          data[`gross_${year}_q2`] = this.parseNumberSafe(value);
        } else if (cellValue.includes('quarter 3') || cellValue.includes('q3')) {
          data[`gross_${year}_q3`] = this.parseNumberSafe(value);
        } else if (cellValue.includes('quarter 4') || cellValue.includes('q4')) {
          data[`gross_${year}_q4`] = this.parseNumberSafe(value);
        }
      }
    }
  }
  
  private extractOwnershipStructure(data: ExtractedData) {
    // Look for ownership structure section
    const ownershipHeader = this.findCellByText('Ownership Structure');
    
    if (ownershipHeader) {
      // Extract ownership percentages
      const owners: any[] = [];
      
      for (let rowOffset = 2; rowOffset <= 10; rowOffset++) {
        const nameCell = this.getRelativeCell(ownershipHeader, rowOffset, 0);
        const percentCell = this.getRelativeCell(ownershipHeader, rowOffset, 1);
        
        if (nameCell && percentCell) {
          owners.push({
            name: String(nameCell).trim(),
            percentage: this.parseNumberSafe(percentCell)
          });
        }
      }
      
      // Store ownership data
      data.ownershipStructure = owners;
    }
  }
  
  /**
   * Safe parsing methods that return defaults instead of throwing
   */
  private parseNumberSafe(value: any): number {
    try {
      if (typeof value === 'number') return value;
      if (value === null || value === undefined || value === '') return 0;
      
      const cleaned = String(value)
        .replace(/[$,]/g, '')
        .replace(/[^\d.-]/g, '')
        .trim();
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }
  
  private parseBooleanSafe(value: any): boolean {
    try {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      if (value === null || value === undefined) return false;
      
      const stringValue = String(value).toLowerCase().trim();
      
      if (['true', 'yes', '1', 'y'].includes(stringValue)) return true;
      if (['false', 'no', '0', 'n', ''].includes(stringValue)) return false;
      
      const numValue = parseFloat(stringValue);
      if (!isNaN(numValue)) return numValue !== 0;
      
      return false;
    } catch {
      return false;
    }
  }
}