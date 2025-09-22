import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { BatchInputRow, BatchMetadata } from '../types/batch.types';
import { getAllBulkUploadFields } from '../config/ercBulkUploadConfig';
import { CustomColumnMapper } from './customColumnMapper';

/**
 * Service to parse batch input files (CSV or Excel) containing Google Sheets URLs and metadata
 */
export class BatchInputParser {
  private static readonly REQUIRED_COLUMN = 'google_sheets_url';
  private static readonly METADATA_COLUMNS = [
    'contact_first_name',
    'contact_last_name',
    'job_title',
    'main_phone',
    'email',
    'original_preparer',
    'notes'
  ];

  /**
   * Parse a CSV or Excel file buffer to extract batch input rows
   */
  static async parseInputFile(fileBuffer: Buffer, filename: string): Promise<{
    success: boolean;
    rows?: BatchInputRow[];
    error?: string;
    warnings?: string[];
  }> {
    try {
      const fileExtension = filename.toLowerCase().split('.').pop();
      
      if (fileExtension === 'csv') {
        return this.parseCSV(fileBuffer);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        return this.parseExcel(fileBuffer);
      } else {
        return {
          success: false,
          error: 'Unsupported file format. Please upload a CSV or Excel file.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse input file'
      };
    }
  }

  /**
   * Parse CSV buffer
   */
  private static parseCSV(buffer: Buffer): {
    success: boolean;
    rows?: BatchInputRow[];
    error?: string;
    warnings?: string[];
  } {
    try {
      const csvString = buffer.toString('utf-8');
      
      // Parse CSV with headers
      const records = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        skip_records_with_empty_values: false
      });

      return this.processRecords(records);
    } catch (error) {
      return {
        success: false,
        error: `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Parse Excel buffer
   */
  private static parseExcel(buffer: Buffer): {
    success: boolean;
    rows?: BatchInputRow[];
    error?: string;
    warnings?: string[];
  } {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Use the first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return {
          success: false,
          error: 'Excel file has no sheets'
        };
      }

      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const records = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        raw: false,  // Keep dates as formatted strings
        dateNF: 'mm/dd/yyyy'  // Date format
      });

      if (records.length < 2) {
        return {
          success: false,
          error: 'Excel file must have headers and at least one data row'
        };
      }

      // Extract headers from first row - PRESERVE EXACT HEADERS
      const originalHeaders = (records[0] as any[]).map(h => String(h));
      
      // Convert to objects using ORIGINAL headers
      const dataRows = records.slice(1).map((row: any) => {
        const obj: any = {};
        originalHeaders.forEach((header, index) => {
          const value = row[index];
          // Keep the value as-is, don't force to string for numbers
          if (value !== undefined && value !== null) {
            obj[header] = value;
          } else {
            obj[header] = '';
          }
        });
        return obj;
      });

      return this.processRecords(dataRows);
    } catch (error) {
      return {
        success: false,
        error: `Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process parsed records to extract batch input rows
   */
  private static processRecords(records: any[]): {
    success: boolean;
    rows?: BatchInputRow[];
    error?: string;
    warnings?: string[];
  } {
    const warnings: string[] = [];
    const rows: BatchInputRow[] = [];
    
    // Check if this is custom format
    const headers = Object.keys(records[0] || {});
    const isCustomFormat = CustomColumnMapper.isCustomFormat(headers);
    
    // Find the Google Sheets URL column (case-insensitive)
    let urlColumnKey = Object.keys(records[0] || {}).find(key => 
      key.toLowerCase().replace(/\s+/g, '_').includes('google_sheets_url') ||
      key.toLowerCase().includes('sheets_url') ||
      key.toLowerCase().includes('url')
    );
    
    // For custom format, the URL is in 'Proper Format Module' column
    // Handle potential trailing spaces in the header
    if (isCustomFormat) {
      urlColumnKey = Object.keys(records[0] || {}).find(key => 
        key.trim() === 'Proper Format Module'
      );
      if (!urlColumnKey) {
        urlColumnKey = 'Proper Format Module';
      }
    }

    if (!urlColumnKey) {
      return {
        success: false,
        error: 'Missing required column: google_sheets_url (or similar URL column)'
      };
    }

    // Process each record
    records.forEach((record, index) => {
      // Check if row has any data at all (not just URL)
      const hasAnyData = Object.values(record).some(value => 
        value !== undefined && value !== null && String(value).trim() !== ''
      );
      
      if (!hasAnyData) {
        warnings.push(`Row ${index + 2}: Skipping completely empty row`);
        return;
      }

      const url = record[urlColumnKey];
      let urlStr = '';
      let hasValidUrl = false;
      
      // Check URL validity
      if (url && String(url).trim() !== '') {
        urlStr = String(url).trim();
        if (this.isValidGoogleSheetsUrl(urlStr)) {
          hasValidUrl = true;
        } else {
          warnings.push(`Row ${index + 2}: Invalid Google Sheets URL format: ${urlStr}`);
          urlStr = ''; // Clear invalid URL
        }
      } else {
        warnings.push(`Row ${index + 2}: No Google Sheets URL provided, using metadata only`);
      }

      // Extract metadata from other columns
      let metadata: BatchMetadata = {};
      
      if (isCustomFormat) {
        // Map custom format to internal format
        metadata = CustomColumnMapper.mapToInternalFormat(record);
      } else {
        // Keep all columns exactly as they appear in the input file
        Object.keys(record).forEach(key => {
          if (key === urlColumnKey) return;
          
          const value = record[key];
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            // Use the original key name to preserve user's column headers
            metadata[key] = String(value).trim();
          }
        });
      }

      // Include row even without URL if it has metadata
      rows.push({
        google_sheets_url: urlStr, // Can be empty string
        metadata,
        rowIndex: index + 2 // +2 because Excel/CSV rows are 1-indexed and we skip header
      });
    });

    if (rows.length === 0) {
      const totalRows = records.length;
      const skippedInfo = warnings.length > 0 
        ? `. ${warnings.length} rows were skipped (check warnings for details)` 
        : '';
      return {
        success: false,
        error: `No processable data found in the file. Processed ${totalRows} rows${skippedInfo}`,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    }

    return {
      success: true,
      rows,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate Google Sheets URL format
   */
  private static isValidGoogleSheetsUrl(url: string): boolean {
    return /docs\.google\.com\/spreadsheets/.test(url) || 
           /^[a-zA-Z0-9-_]+$/.test(url); // Also accept just the ID
  }

  /**
   * Generate sample CSV template for users
   */
  static generateSampleTemplate(): string {
    // Get all bulk upload field names that can be overridden
    const bulkUploadFields = getAllBulkUploadFields();
    const bulkFieldNames = bulkUploadFields.map(f => f.fieldName);
    
    // Start with required google_sheets_url, then all bulk upload fields
    // Note: case_id is auto-generated, but including it allows override if needed
    const headers = ['google_sheets_url', ...bulkFieldNames];
    
    // Create sample rows with varying levels of data completeness
    const sampleRow1 = [
      'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit',
      '', // case_id (leave empty for auto-generation)
      'John', // contact_first_name
      'Smith', // contact_last_name
      'CEO', // job_title
      '555-0100', // main_phone
      'john.smith@company.com', // email
      'ABC Company Inc', // business_legal_name
      'Manufacturing', // industry
      'www.abccompany.com', // website
      '123 Main Street', // business_address
      'Suite 100', // suite_unit
      'New York', // business_city
      'NY', // business_state
      '10001', // business_zip
      'yes', // pays_health_insurance
      'no', // uses_peo
      '', // peo_provider
      '01/01/2019', // start_date
      '50', // current_employee_count
      '45', // employee_count_2019
      'no', // filed_other_entities
      '', // other_entities
      'no', // is_government_entity
      'LLC', // entity_type
      '12-3456789', // ein
      '', // primary_ssn
      '2', // number_of_owners
      'John Smith:60,Jane Smith:40', // owner_percentages
      '0', // family_members_count
      '', // family_members
      'yes', // revenue_drop_qualified
      '2020Q2,2020Q3,2020Q4', // revenue_periods
      '', // operational_triggers (will be extracted)
      '', // claimed_quarters (will be extracted)
      '', // claim_amounts (will be extracted)
      '', // received_checks
      '', // selected_credits (will be extracted)
      'yes', // ppp_received
      'yes', // ppp_forgiven
      '150000', // ppp1_amount
      '150000', // ppp2_amount
      'Significant COVID-19 impact on operations', // hardship_description
      'Tax Professionals LLC', // original_preparer
      '', // form941x_files
      '', // substantiation_files
      '', // health_insurance_files
      'no', // skip_document_generation
      'no', // skip_esignature
      'no', // skip_gdrive_sync
      'normal', // process_priority
      new Date().toISOString(), // upload_date_time
      '' // filed_date
    ];
    
    const sampleRow2 = [
      'https://docs.google.com/spreadsheets/d/ANOTHER_SHEET_ID/edit',
      '', // case_id
      'Jane', // contact_first_name
      'Doe', // contact_last_name
      'CFO', // job_title
      '555-0200', // main_phone
      'jane.doe@business.com', // email
      'XYZ Corporation', // business_legal_name
      'Technology', // industry
      '', // website
      '456 Oak Avenue', // business_address
      '', // suite_unit
      'Los Angeles', // business_city
      'CA', // business_state
      '90001', // business_zip
      'yes', // pays_health_insurance
      'yes', // uses_peo
      'ADP TotalSource', // peo_provider
      '03/15/2018', // start_date
      '100', // current_employee_count
      '85', // employee_count_2019
      ...Array(36).fill('') // Fill remaining fields with empty strings
    ];
    
    // Add a comment row explaining the template
    const commentRow = [
      '# REQUIRED: Add Google Sheets URL here',
      '# All other fields are OPTIONAL - they will override data extracted from Google Sheets if provided',
      ...Array(52).fill('')
    ];

    const csvContent = [
      '# Batch Input Template - Upload multiple Google Sheets for ERC processing',
      '# First column (google_sheets_url) is REQUIRED. All other columns are optional overrides.',
      '# If you provide values in optional columns, they will override the extracted data.',
      '# Delete these comment lines and the sample data before uploading your actual data.',
      '',
      headers.join(','),
      sampleRow1.map(cell => {
        // Properly escape and quote cells
        const str = String(cell || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(','),
      sampleRow2.map(cell => {
        const str = String(cell || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate custom format CSV template for users
   */
  static generateCustomTemplate(): string {
    return CustomColumnMapper.generateCustomTemplate();
  }
}