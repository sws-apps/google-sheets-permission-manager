// ERC Hybrid Mapper Service
// Combines the 52-field bulk upload format with quarterly columns and metadata overrides

import { TransformedERCData } from './dataTransformer';
import { ERCBulkUploadMapper } from './ercBulkUploadMapper';
import { getAllBulkUploadFields } from '../config/ercBulkUploadConfig';

export interface HybridOutputData {
  [key: string]: any;
}

export class ERCHybridMapper {
  /**
   * Format phone number to (XXX) XXX-XXXX format
   */
  private static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if we have exactly 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if not 10 digits
    return phone;
  }

  /**
   * Remove all links and URLs from output data
   * @param data - The hybrid output data
   * @returns Data with all links removed
   */
  static removeLinksFromOutput(data: HybridOutputData): HybridOutputData {
    // Define fields that should NEVER be cleared (protected fields)
    const protectedFields = new Set([
      'email',              // Email address field
      'ein',               // EIN field
      'Customer Email',     // Customer email
      'Customer EIN/TIN',   // Customer EIN
      'EIN'                // Any EIN field
    ]);
    
    // Define fields that should be cleared
    const linkFields = [
      'form941x_files',        // Column AR (44)
      'substantiation_files',   // Column AS (45)
      'health_insurance_files', // Column AT (46)
      '941x Link',
      'Proper Format Module',
      'File Invite Link',
      'Link',  // May appear multiple times
      'Filename',
      'File Path'
    ];
    
    const cleaned = { ...data };
    
    // Clear specific link fields (but skip protected ones)
    for (const field of linkFields) {
      if (!protectedFields.has(field) && field in cleaned) {
        cleaned[field] = '';
      }
    }
    
    // Also scan all string values for URLs and clear them
    for (const [key, value] of Object.entries(cleaned)) {
      // SKIP if it's a protected field
      if (protectedFields.has(key)) {
        continue;
      }
      
      if (typeof value === 'string') {
        // Check if value contains a URL
        if (value.includes('http://') || 
            value.includes('https://') ||
            value.includes('drive.google.com') ||
            value.includes('docs.google.com') ||
            value.includes('www.') ||
            value.includes('.com') ||
            value.includes('.org') ||
            value.includes('.net')) {
          cleaned[key] = '';
        }
      }
    }
    
    return cleaned;
  }

  /**
   * Transform ERC data into hybrid format combining bulk upload fields and quarterly data
   * @param ercData - Transformed ERC data from Google Sheets
   * @param metadata - Metadata from input CSV to override/supplement fields
   * @param options - Processing options including removeLinks flag
   */
  static transformToHybridFormat(
    ercData: TransformedERCData, 
    metadata: any = {},
    options: { removeLinks?: boolean } = {}
  ): HybridOutputData {
    const result: HybridOutputData = {};
    
    // Step 1: Build compound fields from individual quarterly columns if provided
    const compoundFields = this.buildCompoundFields(metadata, ercData);
    
    // Step 2: Generate all 52-54 bulk upload fields
    const bulkUploadFields = getAllBulkUploadFields();
    
    for (const field of bulkUploadFields) {
      try {
        // Check if we have a pre-built compound field
        if (compoundFields[field.fieldName] !== undefined) {
          result[field.fieldName] = compoundFields[field.fieldName];
        }
        // Check if metadata has an override for this field
        else if (metadata[field.fieldName] !== undefined && metadata[field.fieldName] !== null && metadata[field.fieldName] !== '') {
          // Apply formatting for phone numbers
          if (field.fieldName === 'main_phone') {
            result[field.fieldName] = this.formatPhoneNumber(String(metadata[field.fieldName]));
          } else {
            // Use metadata value as-is for other fields
            result[field.fieldName] = String(metadata[field.fieldName]);
          }
        } else {
          // Use generated value from extracted data
          const value = field.generator(ercData);
          result[field.fieldName] = value;
        }
      } catch (error) {
        // Use default value if generation fails
        result[field.fieldName] = field.defaultValue || '';
      }
    }
    
    // Step 3: Add quarterly columns
    const quarterlyData = this.generateQuarterlyColumns(ercData);
    Object.assign(result, quarterlyData);
    
    // Step 4: Add any remaining metadata columns that aren't in the standard fields or quarterly columns
    const standardFieldNames = new Set(bulkUploadFields.map(f => f.fieldName));
    const quarterlyFieldNames = new Set(Object.keys(quarterlyData));
    
    for (const [key, value] of Object.entries(metadata)) {
      if (!standardFieldNames.has(key) && !quarterlyFieldNames.has(key)) {
        // This is a custom column from the input CSV
        result[key] = value;
      }
    }
    
    // Step 5: Remove links if requested
    if (options.removeLinks) {
      return this.removeLinksFromOutput(result);
    }
    
    return result;
  }
  
  /**
   * Build compound fields from individual quarterly columns if provided
   */
  private static buildCompoundFields(metadata: any, ercData: TransformedERCData): any {
    const compoundFields: any = {};
    
    // Build claim_amounts from individual quarterly amount columns if provided
    const claimAmounts: string[] = [];
    
    // Check for 2020 quarterly amounts (Q2-Q4 for ERC)
    if (metadata['2Q20 Amount'] !== undefined && metadata['2Q20 Amount'] !== '') {
      const amount = parseFloat(String(metadata['2Q20 Amount']));
      if (!isNaN(amount) && amount > 0) {
        claimAmounts.push(`2020Q2:${amount.toFixed(2)}`);
      }
    }
    if (metadata['3Q20 Amount'] !== undefined && metadata['3Q20 Amount'] !== '') {
      const amount = parseFloat(String(metadata['3Q20 Amount']));
      if (!isNaN(amount) && amount > 0) {
        claimAmounts.push(`2020Q3:${amount.toFixed(2)}`);
      }
    }
    if (metadata['4Q20 Amount'] !== undefined && metadata['4Q20 Amount'] !== '') {
      const amount = parseFloat(String(metadata['4Q20 Amount']));
      if (!isNaN(amount) && amount > 0) {
        claimAmounts.push(`2020Q4:${amount.toFixed(2)}`);
      }
    }
    
    // Check for 2021 quarterly amounts (Q1-Q3 for ERC)
    if (metadata['1Q21 Amount'] !== undefined && metadata['1Q21 Amount'] !== '') {
      const amount = parseFloat(String(metadata['1Q21 Amount']));
      if (!isNaN(amount) && amount > 0) {
        claimAmounts.push(`2021Q1:${amount.toFixed(2)}`);
      }
    }
    if (metadata['2Q21 Amount'] !== undefined && metadata['2Q21 Amount'] !== '') {
      const amount = parseFloat(String(metadata['2Q21 Amount']));
      if (!isNaN(amount) && amount > 0) {
        claimAmounts.push(`2021Q2:${amount.toFixed(2)}`);
      }
    }
    if (metadata['3Q21 Amount'] !== undefined && metadata['3Q21 Amount'] !== '') {
      const amount = parseFloat(String(metadata['3Q21 Amount']));
      if (!isNaN(amount) && amount > 0) {
        claimAmounts.push(`2021Q3:${amount.toFixed(2)}`);
      }
    }
    
    // If we found individual quarterly amounts, build the claim_amounts field
    if (claimAmounts.length > 0) {
      compoundFields['claim_amounts'] = claimAmounts.join(',');
    }
    
    // Build claimed_quarters from individual qualification columns if provided
    const claimedQuarters: string[] = [];
    
    // Check for 2020 quarterly qualifications
    if (metadata['2Q20 Qualification'] !== undefined && metadata['2Q20 Qualification'] !== '') {
      const qualified = String(metadata['2Q20 Qualification']).toLowerCase();
      if (qualified === 'yes' || qualified === 'true' || qualified === '1') {
        claimedQuarters.push('2020Q2');
      }
    }
    if (metadata['3Q20 Qualification'] !== undefined && metadata['3Q20 Qualification'] !== '') {
      const qualified = String(metadata['3Q20 Qualification']).toLowerCase();
      if (qualified === 'yes' || qualified === 'true' || qualified === '1') {
        claimedQuarters.push('2020Q3');
      }
    }
    if (metadata['4Q20 Qualification'] !== undefined && metadata['4Q20 Qualification'] !== '') {
      const qualified = String(metadata['4Q20 Qualification']).toLowerCase();
      if (qualified === 'yes' || qualified === 'true' || qualified === '1') {
        claimedQuarters.push('2020Q4');
      }
    }
    
    // Check for 2021 quarterly qualifications
    if (metadata['1Q21 Qualification'] !== undefined && metadata['1Q21 Qualification'] !== '') {
      const qualified = String(metadata['1Q21 Qualification']).toLowerCase();
      if (qualified === 'yes' || qualified === 'true' || qualified === '1') {
        claimedQuarters.push('2021Q1');
      }
    }
    if (metadata['2Q21 Qualification'] !== undefined && metadata['2Q21 Qualification'] !== '') {
      const qualified = String(metadata['2Q21 Qualification']).toLowerCase();
      if (qualified === 'yes' || qualified === 'true' || qualified === '1') {
        claimedQuarters.push('2021Q2');
      }
    }
    if (metadata['3Q21 Qualification'] !== undefined && metadata['3Q21 Qualification'] !== '') {
      const qualified = String(metadata['3Q21 Qualification']).toLowerCase();
      if (qualified === 'yes' || qualified === 'true' || qualified === '1') {
        claimedQuarters.push('2021Q3');
      }
    }
    
    // If we found individual quarterly qualifications, build the claimed_quarters field
    if (claimedQuarters.length > 0) {
      compoundFields['claimed_quarters'] = claimedQuarters.join(',');
    }
    
    return compoundFields;
  }
  
  /**
   * Generate quarterly columns data
   */
  private static generateQuarterlyColumns(ercData: TransformedERCData): any {
    const quarterly: any = {
      'Claim Total': 0,
      '2Q20 Qualification': 'No',
      '2Q20 Amount': 0,
      '3Q20 Qualification': 'No',
      '3Q20 Amount': 0,
      '4Q20 Qualification': 'No',
      '4Q20 Amount': 0,
      '1Q21 Qualification': 'No',
      '1Q21 Amount': 0,
      '2Q21 Qualification': 'No',
      '2Q21 Amount': 0,
      '3Q21 Qualification': 'No',
      '3Q21 Amount': 0,
      '4Q21 Qualification': 'No',
      '4Q21 Amount': 0,
      'Refunded by IRS': 0,
      'Disallowed by IRS': 0,
      '19Q1': 0,
      '19Q2': 0,
      '19Q3': 0,
      '19Q4': 0,
      '20Q1': 0,
      '20Q2': 0,
      '20Q3': 0,
      '20Q4': 0,
      '21Q1': 0,
      '21Q2': 0,
      '21Q3': 0,
      '21Q4': 0
    };

    let claimTotal = 0;

    // Process 2020 Q2-Q4 qualifications and amounts
    if (ercData.qualifyingQuestions?.['2020']) {
      const year2020 = ercData.qualifyingQuestions['2020'];
      
      // Q2 2020
      if (year2020.Q2) {
        const qualified = year2020.Q2.governmentShutdown || 
                         year2020.Q2.revenueReduction10Percent || 
                         year2020.Q2.supplyDisruptions ||
                         year2020.Q2.vendorDisruptions;
        quarterly['2Q20 Qualification'] = qualified ? 'Yes' : 'No';
        
        const amount = ercData.form941Data?.['2020']?.Q2?.retentionCreditWages || 0;
        quarterly['2Q20 Amount'] = amount;
        if (qualified) claimTotal += amount;
      }
      
      // Q3 2020
      if (year2020.Q3) {
        const qualified = year2020.Q3.governmentShutdown || 
                         year2020.Q3.revenueReduction10Percent || 
                         year2020.Q3.supplyDisruptions ||
                         year2020.Q3.vendorDisruptions;
        quarterly['3Q20 Qualification'] = qualified ? 'Yes' : 'No';
        
        const amount = ercData.form941Data?.['2020']?.Q3?.retentionCreditWages || 0;
        quarterly['3Q20 Amount'] = amount;
        if (qualified) claimTotal += amount;
      }
      
      // Q4 2020
      if (year2020.Q4) {
        const qualified = year2020.Q4.governmentShutdown || 
                         year2020.Q4.revenueReduction10Percent || 
                         year2020.Q4.supplyDisruptions ||
                         year2020.Q4.vendorDisruptions;
        quarterly['4Q20 Qualification'] = qualified ? 'Yes' : 'No';
        
        const amount = ercData.form941Data?.['2020']?.Q4?.retentionCreditWages || 0;
        quarterly['4Q20 Amount'] = amount;
        if (qualified) claimTotal += amount;
      }
    }

    // Process 2021 Q1-Q3 qualifications and amounts
    if (ercData.qualifyingQuestions?.['2021']) {
      const year2021 = ercData.qualifyingQuestions['2021'];
      
      // Q1 2021
      if (year2021.Q1) {
        const qualified = year2021.Q1.governmentShutdown || 
                         year2021.Q1.revenueReduction20Percent || 
                         year2021.Q1.supplyDisruptions ||
                         year2021.Q1.vendorDisruptions;
        quarterly['1Q21 Qualification'] = qualified ? 'Yes' : 'No';
        
        const amount = ercData.form941Data?.['2021']?.Q1?.retentionCreditWages || 0;
        quarterly['1Q21 Amount'] = amount;
        if (qualified) claimTotal += amount;
      }
      
      // Q2 2021
      if (year2021.Q2) {
        const qualified = year2021.Q2.governmentShutdown || 
                         year2021.Q2.revenueReduction20Percent || 
                         year2021.Q2.supplyDisruptions ||
                         year2021.Q2.vendorDisruptions;
        quarterly['2Q21 Qualification'] = qualified ? 'Yes' : 'No';
        
        const amount = ercData.form941Data?.['2021']?.Q2?.retentionCreditWages || 0;
        quarterly['2Q21 Amount'] = amount;
        if (qualified) claimTotal += amount;
      }
      
      // Q3 2021
      if (year2021.Q3) {
        const qualified = year2021.Q3.governmentShutdown || 
                         year2021.Q3.revenueReduction20Percent || 
                         year2021.Q3.supplyDisruptions ||
                         year2021.Q3.vendorDisruptions;
        quarterly['3Q21 Qualification'] = qualified ? 'Yes' : 'No';
        
        const amount = ercData.form941Data?.['2021']?.Q3?.retentionCreditWages || 0;
        quarterly['3Q21 Amount'] = amount;
        if (qualified) claimTotal += amount;
      }
      
      // Q4 2021 (not eligible for ERC but included in format)
      quarterly['4Q21 Qualification'] = 'No';
      quarterly['4Q21 Amount'] = 0;
    }

    // Set claim total
    quarterly['Claim Total'] = claimTotal;

    // Extract wage data for all quarters
    // 2019 wages - set to 0 as we don't have 2019 data
    quarterly['19Q1'] = 0;
    quarterly['19Q2'] = 0;
    quarterly['19Q3'] = 0;
    quarterly['19Q4'] = 0;

    // 2020 wages
    if (ercData.form941Data?.['2020']) {
      quarterly['20Q1'] = ercData.form941Data['2020'].Q1?.totalWages || 0;
      quarterly['20Q2'] = ercData.form941Data['2020'].Q2?.totalWages || 0;
      quarterly['20Q3'] = ercData.form941Data['2020'].Q3?.totalWages || 0;
      quarterly['20Q4'] = ercData.form941Data['2020'].Q4?.totalWages || 0;
    }

    // 2021 wages
    if (ercData.form941Data?.['2021']) {
      quarterly['21Q1'] = ercData.form941Data['2021'].Q1?.totalWages || 0;
      quarterly['21Q2'] = ercData.form941Data['2021'].Q2?.totalWages || 0;
      quarterly['21Q3'] = ercData.form941Data['2021'].Q3?.totalWages || 0;
      quarterly['21Q4'] = ercData.form941Data['2021'].Q4?.totalWages || 0;
    }

    return quarterly;
  }
  
  /**
   * Get ordered headers for the hybrid format
   */
  static getHeaders(processedData: HybridOutputData): string[] {
    // First, get all bulk upload field names in order
    const bulkUploadFields = getAllBulkUploadFields();
    const standardHeaders = bulkUploadFields.map(f => f.fieldName);
    
    // Then add quarterly column headers in specific order
    // Note: EIN is already in the standard 52 fields (field #25), so we don't duplicate it
    const quarterlyHeaders = [
      'Claim Total',
      '2Q20 Qualification',
      '2Q20 Amount',
      '3Q20 Qualification',
      '3Q20 Amount',
      '4Q20 Qualification',
      '4Q20 Amount',
      '1Q21 Qualification',
      '1Q21 Amount',
      '2Q21 Qualification',
      '2Q21 Amount',
      '3Q21 Qualification',
      '3Q21 Amount',
      '4Q21 Qualification',
      '4Q21 Amount',
      'Refunded by IRS',
      'Disallowed by IRS',
      '19Q1',
      '19Q2',
      '19Q3',
      '19Q4',
      '20Q1',
      '20Q2',
      '20Q3',
      '20Q4',
      '21Q1',
      '21Q2',
      '21Q3',
      '21Q4'
    ];
    
    // Finally, add any custom columns from the data
    const allHeaders = [...standardHeaders, ...quarterlyHeaders];
    const headerSet = new Set(allHeaders);
    
    // Add any remaining columns from processedData
    for (const key of Object.keys(processedData)) {
      if (!headerSet.has(key)) {
        allHeaders.push(key);
      }
    }
    
    return allHeaders;
  }
}