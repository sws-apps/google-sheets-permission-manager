import * as XLSX from 'xlsx';
import { ERC_TEMPLATE_CONFIG, CellMapping, getDataValueMappings, TemplateSection } from '../config/ercTemplateConfig';

export interface ExtractedData {
  [fieldName: string]: any;
}

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedData;
  errors?: string[];
  warnings?: string[];
}

export class ExcelTemplateParser {
  protected workbook: XLSX.WorkBook | null = null;
  protected worksheets: { [sheetName: string]: XLSX.WorkSheet } = {};
  protected errors: string[] = [];
  protected warnings: string[] = [];

  /**
   * Load an Excel file from buffer or file path
   */
  async loadFile(fileBuffer: Buffer | string): Promise<boolean> {
    try {
      if (typeof fileBuffer === 'string') {
        this.workbook = XLSX.readFile(fileBuffer);
      } else {
        this.workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      }

      // Load all configured sheets
      const requiredSheets = Object.values(ERC_TEMPLATE_CONFIG.sheets);
      const missingSheets: string[] = [];

      for (const sheetName of requiredSheets) {
        if (this.workbook.SheetNames.includes(sheetName)) {
          this.worksheets[sheetName] = this.workbook.Sheets[sheetName];
        } else {
          // Not all sheets are required - just warn if optional sheets are missing
          if (sheetName === ERC_TEMPLATE_CONFIG.sheets.main) {
            missingSheets.push(sheetName);
          } else {
            this.warnings.push(`Optional sheet "${sheetName}" not found`);
          }
        }
      }

      if (missingSheets.length > 0) {
        this.errors.push(`Required sheets not found: ${missingSheets.join(', ')}. Available sheets: ${this.workbook.SheetNames.join(', ')}`);
        return false;
      }

      return true;
    } catch (error) {
      this.errors.push(`Failed to load Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Extract all data based on the template configuration
   */
  extractData(): ExtractionResult {
    if (Object.keys(this.worksheets).length === 0) {
      return {
        success: false,
        errors: ['No worksheets loaded. Call loadFile first.']
      };
    }

    const extractedData: ExtractedData = {};
    this.errors = [];
    this.warnings = [];

    // Extract data from each section
    for (const section of ERC_TEMPLATE_CONFIG.sections) {
      for (const mapping of section.mappings) {
        if (mapping.mappingType === 'DATA_VALUE') {
          const value = this.extractCellValue(mapping);
          if (value !== undefined) {
            extractedData[mapping.fieldName] = value;
          }
        }
      }
    }

    return {
      success: this.errors.length === 0,
      data: extractedData,
      errors: this.errors.length > 0 ? this.errors : undefined,
      warnings: this.warnings.length > 0 ? this.warnings : undefined
    };
  }

  /**
   * Extract data only from specific sections
   */
  extractSections(sectionNames: string[]): ExtractionResult {
    if (!this.worksheets || Object.keys(this.worksheets).length === 0) {
      return {
        success: false,
        errors: ['No worksheets loaded. Call loadFile first.']
      };
    }

    const extractedData: ExtractedData = {};
    this.errors = [];
    this.warnings = [];

    const sections = ERC_TEMPLATE_CONFIG.sections.filter(s => sectionNames.includes(s.name));

    for (const section of sections) {
      for (const mapping of section.mappings) {
        if (mapping.mappingType === 'DATA_VALUE') {
          const value = this.extractCellValue(mapping);
          if (value !== undefined) {
            extractedData[mapping.fieldName] = value;
          }
        }
      }
    }

    return {
      success: this.errors.length === 0,
      data: extractedData,
      errors: this.errors.length > 0 ? this.errors : undefined,
      warnings: this.warnings.length > 0 ? this.warnings : undefined
    };
  }

  /**
   * Extract value from a specific cell based on mapping configuration
   */
  private extractCellValue(mapping: CellMapping): any {
    // Determine which sheet to use
    const sheetName = mapping.sheet || ERC_TEMPLATE_CONFIG.sheets.main;
    const worksheet = this.worksheets[sheetName];
    
    if (!worksheet) {
      this.warnings.push(`Sheet "${sheetName}" not loaded for cell ${mapping.cell} (${mapping.fieldName})`);
      return undefined;
    }

    const cell = worksheet[mapping.cell];
    
    if (!cell || cell.v === undefined || cell.v === null || cell.v === '') {
      this.warnings.push(`Cell ${mapping.cell} (${mapping.fieldName}) is empty`);
      return mapping.dataType === 'NUMBER' ? 0 : 
             mapping.dataType === 'BOOLEAN' ? false : '';
    }

    const rawValue = cell.v;

    try {
      switch (mapping.dataType) {
        case 'NUMBER':
          return this.parseNumber(rawValue);
        
        case 'BOOLEAN':
          return this.parseBoolean(rawValue);
        
        case 'PERCENTAGE':
          return this.parsePercentage(rawValue);
        
        case 'TEXT':
        default:
          return String(rawValue).trim();
      }
    } catch (error) {
      // For type mismatches, try to be more lenient
      if (mapping.dataType === 'NUMBER' && typeof rawValue === 'string') {
        // If it's text where we expect a number, return 0 and warn
        this.warnings.push(`Cell ${mapping.cell} (${mapping.fieldName}) contains text "${rawValue}" but expects a number. Using 0.`);
        return 0;
      }
      
      this.errors.push(`Error parsing cell ${mapping.cell} (${mapping.fieldName}): ${error instanceof Error ? error.message : 'Unknown error'}`);
      return undefined;
    }
  }

  /**
   * Parse numeric value, handling various formats
   */
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    
    // Remove common formatting characters
    const cleaned = String(value)
      .replace(/[$,]/g, '')
      .replace(/\s/g, '')
      .trim();
    
    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) {
      throw new Error(`Cannot parse "${value}" as number`);
    }
    
    return parsed;
  }

  /**
   * Parse boolean value
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    
    // Handle numeric values: 0 = false, any other number = true
    if (typeof value === 'number') return value !== 0;
    
    const stringValue = String(value).toLowerCase().trim();
    
    // Common boolean representations
    if (['true', 'yes', '1', 'y'].includes(stringValue)) return true;
    if (['false', 'no', '0', 'n', ''].includes(stringValue)) return false;
    
    // Try to parse as number (for cases like "2", "3", etc.)
    const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      return numValue !== 0;
    }
    
    throw new Error(`Cannot parse "${value}" as boolean`);
  }

  /**
   * Parse percentage value (returns as whole number, e.g., 50 for 50%)
   */
  private parsePercentage(value: any): number {
    if (typeof value === 'number') {
      // If it's a decimal less than 1, assume it's already in decimal format (0.5 = 50%)
      // If it's 1 or greater, assume it's already a whole number percentage (50 = 50%)
      return value <= 1 ? value * 100 : value;
    }
    
    const stringValue = String(value).trim();
    const percentMatch = stringValue.match(/^([\d.]+)%?$/);
    
    if (percentMatch) {
      const num = parseFloat(percentMatch[1]);
      // If string includes %, the number is already in percentage form
      // If not, and it's <= 1, treat as decimal; otherwise as percentage
      if (stringValue.includes('%')) {
        return num;
      } else {
        return num <= 1 ? num * 100 : num;
      }
    }
    
    throw new Error(`Cannot parse "${value}" as percentage`);
  }

  /**
   * Get a summary of all extracted data organized by section
   */
  getSummary(data: ExtractedData): any {
    const summary: any = {};

    // Organize data by section
    for (const section of ERC_TEMPLATE_CONFIG.sections) {
      summary[section.name] = {};
      
      for (const mapping of section.mappings) {
        if (mapping.mappingType === 'DATA_VALUE' && data[mapping.fieldName] !== undefined) {
          summary[section.name][mapping.fieldName] = data[mapping.fieldName];
        }
      }
      
      // Remove empty sections
      if (Object.keys(summary[section.name]).length === 0) {
        delete summary[section.name];
      }
    }

    return summary;
  }

  /**
   * Validate extracted data against expected template structure
   */
  validateData(data: ExtractedData): { isValid: boolean; missingFields: string[]; invalidFields: string[] } {
    const dataValueMappings = getDataValueMappings();
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    for (const mapping of dataValueMappings) {
      const value = data[mapping.fieldName];
      
      if (value === undefined || value === null || value === '') {
        missingFields.push(`${mapping.fieldName} (${mapping.cell})`);
      } else {
        // Type validation
        switch (mapping.dataType) {
          case 'NUMBER':
          case 'PERCENTAGE':
            if (typeof value !== 'number' || isNaN(value)) {
              invalidFields.push(`${mapping.fieldName} (${mapping.cell}) - expected number, got ${typeof value}`);
            }
            break;
          
          case 'BOOLEAN':
            if (typeof value !== 'boolean') {
              invalidFields.push(`${mapping.fieldName} (${mapping.cell}) - expected boolean, got ${typeof value}`);
            }
            break;
        }
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidFields.length === 0,
      missingFields,
      invalidFields
    };
  }
}