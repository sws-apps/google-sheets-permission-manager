// ERC Quarterly Mapper Service
// Transforms extracted ERC data into quarterly format for custom CSV output

import { TransformedERCData } from './dataTransformer';

export interface QuarterlyData {
  qualification: boolean;
  amount: number;
}

export interface ERCQuarterlyFormat {
  // Core fields
  'Claim Total': number;
  
  // 2020 Quarters (Q2-Q4 for ERC)
  '2Q20 Qualification': string;
  '2Q20 Amount': number;
  '3Q20 Qualification': string;
  '3Q20 Amount': number;
  '4Q20 Qualification': string;
  '4Q20 Amount': number;
  
  // 2021 Quarters (Q1-Q3 for ERC)
  '1Q21 Qualification': string;
  '1Q21 Amount': number;
  '2Q21 Qualification': string;
  '2Q21 Amount': number;
  '3Q21 Qualification': string;
  '3Q21 Amount': number;
  '4Q21 Qualification': string;
  '4Q21 Amount': number;
  
  // IRS Status
  'Refunded by IRS': number;
  'Disallowed by IRS': number;
  
  // Company Info
  'EIN': string;
  
  // 2019 Quarterly Wages (baseline year)
  '19Q1': number;
  '19Q2': number;
  '19Q3': number;
  '19Q4': number;
  
  // 2020 Quarterly Wages
  '20Q1': number;
  '20Q2': number;
  '20Q3': number;
  '20Q4': number;
  
  // 2021 Quarterly Wages
  '21Q1': number;
  '21Q2': number;
  '21Q3': number;
  '21Q4': number;
}

export class ERCQuarterlyMapper {
  /**
   * Transform ERC data into quarterly format
   */
  static transformToQuarterlyFormat(ercData: TransformedERCData, metadata: any = {}): any {
    const quarterly: ERCQuarterlyFormat = {
      // Initialize all fields with defaults
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
      
      'EIN': ercData.companyInfo?.ein || '',
      
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
    // 2019 wages - set to 0 as we don't have 2019 data in the current structure
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

    // Merge with metadata from input CSV (preserving all original columns)
    // Metadata comes first, then quarterly data overwrites any conflicting keys
    const result = {
      ...metadata,  // All original CSV columns
      ...quarterly  // ERC quarterly data
    };

    return result;
  }

  /**
   * Get headers for the quarterly format CSV
   * Combines metadata headers with quarterly format headers
   */
  static getHeaders(metadataKeys: string[]): string[] {
    // Start with metadata columns from input CSV
    const headers = [...metadataKeys];
    
    // Add quarterly format columns
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
      'EIN',
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

    // Add quarterly headers that aren't already in metadata
    quarterlyHeaders.forEach(header => {
      if (!headers.includes(header)) {
        headers.push(header);
      }
    });

    return headers;
  }

  /**
   * Generate a row array from the quarterly data object
   */
  static generateRow(data: any, headers: string[]): string[] {
    return headers.map(header => {
      const value = data[header];
      if (value === undefined || value === null) return '';
      if (typeof value === 'number') return value.toString();
      return String(value);
    });
  }
}