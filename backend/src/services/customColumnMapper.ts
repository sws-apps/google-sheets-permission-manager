// Custom Column Mapper for specific batch upload format
// Maps custom headers to internal field names and handles special parsing

export interface CustomColumnMapping {
  customHeader: string;
  internalField: string;
  parser?: (value: string) => any;
}

export class CustomColumnMapper {
  // Define the exact column headers in order as provided by user
  static readonly CUSTOM_HEADERS = [
    'Customer Name/Business Name',
    'Filename',
    'File Path',
    'Processing Time',
    'Status',
    'Customer Name/Business Name', // Duplicate in original
    'Customer EIN/TIN',
    'Customer Address (Full)',
    'Customer Contact Name',
    'Customer Phone',
    'Customer Email',
    'Agreement Date',
    'Effective Date',
    'Termination Date',
    'Service Description',
    'Payment Percentage',
    'Payment Timeline',
    'Agreement Type',
    'Document Description',
    'Signatory Name (Customer)',
    'Signatory Title (Customer)',
    'Additional Notes',
    '941x Link',
    'Proper Format Module',
    'File Invite Link',
    '941x 2020 Q2',
    '941x 2020 Q3',
    '941x 2020 Q4',
    '941x 2021 Q1',
    '941x 2021 Q2',
    '941x 2021 Q3',
    '941x', // Duplicate columns
    '941x',
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
    '21Q4',
    'Link',
    'Link', // Duplicate in original
    'Address',
    'City, State, Zip',
    'file date',
    'Contact Phone number'
  ];

  /**
   * Parse dollar amount string or number to number
   * Handles formats like "$49,882.53" or "49882.53" or "$0.00" or raw numbers
   */
  static parseDollarAmount(value: string | number): number {
    if (value === undefined || value === null || value === '') return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    // Remove $, commas, and spaces from string
    const cleaned = String(value).replace(/[$,\s]/g, '');
    const amount = parseFloat(cleaned);
    
    return isNaN(amount) ? 0 : amount;
  }

  /**
   * Parse Excel date serial number to date string
   * Excel stores dates as numbers representing days since 1900-01-01
   * @param value - Excel serial number or date string
   * @returns Date string in MM/DD/YYYY format
   */
  static parseExcelDate(value: string | number): string {
    if (!value) return '';
    
    // If it's already a string that looks like a date, return it
    if (typeof value === 'string') {
      // Check if it's already in a date format
      if (value.includes('/') || value.includes('-')) {
        return value;
      }
      // Try to parse as number
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      value = num;
    }
    
    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      // Excel epoch is January 1, 1900, but JavaScript epoch is January 1, 1970
      // Excel serial date 1 = January 1, 1900
      // Need to account for the difference and Excel's leap year bug
      const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
      const msPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + value * msPerDay);
      
      // Format as MM/DD/YYYY
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}/${day}/${year}`;
    }
    
    return String(value);
  }

  /**
   * Parse qualification text to boolean
   * "N/A" or empty = false (not qualified)
   * Any other text = true (qualified)
   */
  static parseQualification(value: string): boolean {
    if (!value || value.trim() === '') return false;
    
    const lowerValue = value.toLowerCase().trim();
    return lowerValue !== 'n/a' && lowerValue !== 'na' && lowerValue !== '';
  }

  /**
   * Parse contact name into first and last name
   */
  static parseContactName(fullName: string): { firstName: string; lastName: string } {
    if (!fullName || fullName.trim() === '') {
      return { firstName: '', lastName: '' };
    }
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    
    // Assume first word is first name, rest is last name
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    
    return { firstName, lastName };
  }

  /**
   * Format phone number to (XXX) XXX-XXXX format
   */
  static formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = String(phone).replace(/\D/g, '');
    
    // Check if we have exactly 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return original if not 10 digits
    return String(phone);
  }

  /**
   * Parse full address into components
   * Example: "507 watercrest Circle, Elizabeth City NC 27909"
   * Returns: { street, city, state, zip, cityStateZip }
   */
  static parseFullAddress(fullAddress: string): {
    street: string;
    city: string;
    state: string;
    zip: string;
    cityStateZip: string;
  } {
    if (!fullAddress || fullAddress.trim() === '') {
      return {
        street: '',
        city: '',
        state: '',
        zip: '',
        cityStateZip: ''
      };
    }

    // Common patterns for parsing addresses
    // Pattern 1: "Street, City State Zip"
    // Pattern 2: "Street Suite/Unit, City State Zip"
    
    const address = fullAddress.trim();
    
    // Try to split by comma first (most common format)
    const parts = address.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      // Street is everything before the first comma
      const street = parts[0];
      
      // City, State, Zip is everything after
      const cityStateZip = parts.slice(1).join(', ').trim();
      
      // Parse city, state, zip from the second part
      // Look for pattern: "City State Zip" or "City, State Zip"
      const cityStateZipParts = cityStateZip.replace(/,/g, ' ').trim().split(/\s+/);
      
      let city = '';
      let state = '';
      let zip = '';
      
      if (cityStateZipParts.length >= 3) {
        // Assume last item is zip (5 or 9 digits)
        const lastPart = cityStateZipParts[cityStateZipParts.length - 1];
        if (/^\d{5}(-\d{4})?$/.test(lastPart)) {
          zip = lastPart;
          // Second to last should be state (2 letters)
          const statePart = cityStateZipParts[cityStateZipParts.length - 2];
          if (/^[A-Z]{2}$/i.test(statePart)) {
            state = statePart.toUpperCase();
            // Everything else is city
            city = cityStateZipParts.slice(0, -2).join(' ');
          } else {
            // State might be part of city name, take more parts
            city = cityStateZipParts.slice(0, -1).join(' ');
          }
        } else {
          // No valid zip found, try to parse differently
          // Assume last word is state if it's 2 letters
          const statePart = cityStateZipParts[cityStateZipParts.length - 1];
          if (/^[A-Z]{2}$/i.test(statePart)) {
            state = statePart.toUpperCase();
            city = cityStateZipParts.slice(0, -1).join(' ');
          } else {
            city = cityStateZip;
          }
        }
      } else if (cityStateZipParts.length === 2) {
        // Might be "City State" without zip
        const statePart = cityStateZipParts[1];
        if (/^[A-Z]{2}$/i.test(statePart)) {
          city = cityStateZipParts[0];
          state = statePart.toUpperCase();
        } else {
          city = cityStateZip;
        }
      } else {
        city = cityStateZip;
      }
      
      // Format the combined city, state, zip
      const formattedCityStateZip = [city, state, zip]
        .filter(p => p)
        .join(state && zip ? ', ' : ' ')
        .replace(/,\s*,/g, ',')
        .trim();
      
      return {
        street,
        city,
        state,
        zip,
        cityStateZip: formattedCityStateZip || cityStateZip
      };
    }
    
    // No comma found, try to parse as space-separated
    // This is less reliable but better than nothing
    const words = address.split(/\s+/);
    
    // Look for zip code pattern at the end
    let zipIndex = -1;
    for (let i = words.length - 1; i >= 0; i--) {
      if (/^\d{5}(-\d{4})?$/.test(words[i])) {
        zipIndex = i;
        break;
      }
    }
    
    if (zipIndex > 0) {
      const zip = words[zipIndex];
      // Check if word before zip is a state
      let state = '';
      let stateIndex = zipIndex;
      if (zipIndex > 0 && /^[A-Z]{2}$/i.test(words[zipIndex - 1])) {
        state = words[zipIndex - 1].toUpperCase();
        stateIndex = zipIndex - 1;
      }
      
      // Assume everything before state is street/city
      // This is a guess - we'll put most in street
      const street = words.slice(0, Math.max(1, stateIndex - 1)).join(' ');
      const city = stateIndex > 1 ? words[stateIndex - 1] : '';
      
      const cityStateZip = [city, state, zip]
        .filter(p => p)
        .join(state && zip ? ', ' : ' ')
        .trim();
      
      return {
        street,
        city,
        state,
        zip,
        cityStateZip
      };
    }
    
    // Couldn't parse reliably, return the whole thing as street
    return {
      street: address,
      city: '',
      state: '',
      zip: '',
      cityStateZip: ''
    };
  }

  /**
   * Map custom headers to internal field names
   */
  static mapToInternalFormat(row: any): any {
    const mapped: any = {};
    
    // Map basic business information
    if (row['Customer Name/Business Name']) {
      mapped['business_legal_name'] = row['Customer Name/Business Name'];
    }
    
    // Check both 'Customer EIN/TIN' and 'EIN' columns for EIN value
    if (row['Customer EIN/TIN']) {
      mapped['ein'] = row['Customer EIN/TIN'];
    }
    // Fallback to 'EIN' column if 'Customer EIN/TIN' is empty or not set
    if ((!mapped['ein'] || mapped['ein'] === '') && row['EIN']) {
      mapped['ein'] = row['EIN'];
    }
    
    if (row['Customer Address (Full)']) {
      // Parse the full address into components
      const addressParts = this.parseFullAddress(row['Customer Address (Full)']);
      
      // Map to standard business address fields
      mapped['business_address'] = addressParts.street;
      mapped['business_city'] = addressParts.city;
      mapped['business_state'] = addressParts.state;
      mapped['business_zip'] = addressParts.zip;
      
      // Also map to the new custom columns
      mapped['Address'] = addressParts.street;
      mapped['City, State, Zip'] = addressParts.cityStateZip;
    }
    
    if (row['Customer Contact Name']) {
      const { firstName, lastName } = this.parseContactName(row['Customer Contact Name']);
      mapped['contact_first_name'] = firstName;
      mapped['contact_last_name'] = lastName;
    }
    
    // Map phone number - prioritize Contact Phone number over Customer Phone
    if (row['Customer Phone']) {
      mapped['main_phone'] = this.formatPhoneNumber(row['Customer Phone']);
    }
    // Override with Contact Phone number if available (takes priority)
    if (row['Contact Phone number'] && row['Contact Phone number'].trim() !== '') {
      mapped['main_phone'] = this.formatPhoneNumber(row['Contact Phone number']);
    }
    
    if (row['Customer Email']) {
      mapped['email'] = row['Customer Email'];
    }
    
    // Map agreement information with date conversion
    if (row['Agreement Date']) {
      mapped['agreement_date'] = this.parseExcelDate(row['Agreement Date']);
    }
    
    if (row['Effective Date']) {
      mapped['effective_date'] = this.parseExcelDate(row['Effective Date']);
    }
    
    if (row['Termination Date']) {
      mapped['termination_date'] = this.parseExcelDate(row['Termination Date']);
    }
    
    if (row['Signatory Title (Customer)']) {
      mapped['job_title'] = row['Signatory Title (Customer)'];
    }
    
    if (row['Additional Notes']) {
      mapped['notes'] = row['Additional Notes'];
    }
    
    // Map quarterly amounts (parse dollar amounts)
    if (row['2Q20 Amount'] !== undefined && row['2Q20 Amount'] !== '') {
      mapped['2Q20 Amount'] = this.parseDollarAmount(row['2Q20 Amount']);
    }
    if (row['3Q20 Amount'] !== undefined && row['3Q20 Amount'] !== '') {
      mapped['3Q20 Amount'] = this.parseDollarAmount(row['3Q20 Amount']);
    }
    if (row['4Q20 Amount'] !== undefined && row['4Q20 Amount'] !== '') {
      mapped['4Q20 Amount'] = this.parseDollarAmount(row['4Q20 Amount']);
    }
    if (row['1Q21 Amount'] !== undefined && row['1Q21 Amount'] !== '') {
      mapped['1Q21 Amount'] = this.parseDollarAmount(row['1Q21 Amount']);
    }
    if (row['2Q21 Amount'] !== undefined && row['2Q21 Amount'] !== '') {
      mapped['2Q21 Amount'] = this.parseDollarAmount(row['2Q21 Amount']);
    }
    if (row['3Q21 Amount'] !== undefined && row['3Q21 Amount'] !== '') {
      mapped['3Q21 Amount'] = this.parseDollarAmount(row['3Q21 Amount']);
    }
    if (row['4Q21 Amount'] !== undefined && row['4Q21 Amount'] !== '') {
      // Handle special case where value might be "$0.00 " with trailing space
      const value = typeof row['4Q21 Amount'] === 'string' ? row['4Q21 Amount'].trim() : row['4Q21 Amount'];
      mapped['4Q21 Amount'] = this.parseDollarAmount(value);
    }
    
    // Map quarterly qualifications
    // If amount > 0, they're qualified regardless of text
    // If amount = 0, they're not qualified
    if (row['2Q20 Amount'] !== undefined && row['2Q20 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['2Q20 Amount']);
      mapped['2Q20 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['2Q20 Qualification'] && amount > 0) {
        mapped['2Q20_qualification_reason'] = row['2Q20 Qualification'];
      }
    }
    
    if (row['3Q20 Amount'] !== undefined && row['3Q20 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['3Q20 Amount']);
      mapped['3Q20 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['3Q20 Qualification'] && amount > 0) {
        mapped['3Q20_qualification_reason'] = row['3Q20 Qualification'];
      }
    }
    
    if (row['4Q20 Amount'] !== undefined && row['4Q20 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['4Q20 Amount']);
      mapped['4Q20 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['4Q20 Qualification'] && amount > 0) {
        mapped['4Q20_qualification_reason'] = row['4Q20 Qualification'];
      }
    }
    
    if (row['1Q21 Amount'] !== undefined && row['1Q21 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['1Q21 Amount']);
      mapped['1Q21 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['1Q21 Qualification'] && amount > 0) {
        mapped['1Q21_qualification_reason'] = row['1Q21 Qualification'];
      }
    }
    
    if (row['2Q21 Amount'] !== undefined && row['2Q21 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['2Q21 Amount']);
      mapped['2Q21 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['2Q21 Qualification'] && amount > 0) {
        mapped['2Q21_qualification_reason'] = row['2Q21 Qualification'];
      }
    }
    
    if (row['3Q21 Amount'] !== undefined && row['3Q21 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['3Q21 Amount']);
      mapped['3Q21 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['3Q21 Qualification'] && amount > 0) {
        mapped['3Q21_qualification_reason'] = row['3Q21 Qualification'];
      }
    }
    
    if (row['4Q21 Amount'] !== undefined && row['4Q21 Amount'] !== '') {
      const amount = this.parseDollarAmount(row['4Q21 Amount']);
      mapped['4Q21 Qualification'] = amount > 0 ? 'Yes' : 'No';
      if (row['4Q21 Qualification'] && amount > 0) {
        mapped['4Q21_qualification_reason'] = row['4Q21 Qualification'];
      }
    }
    
    // Map Claim Total
    if (row['Claim Total'] !== undefined) {
      mapped['claim_total'] = this.parseDollarAmount(row['Claim Total']);
    }
    
    // Map IRS status
    if (row['Refunded by IRS'] !== undefined) {
      mapped['Refunded by IRS'] = this.parseDollarAmount(row['Refunded by IRS']);
    }
    if (row['Disallowed by IRS'] !== undefined) {
      mapped['Disallowed by IRS'] = this.parseDollarAmount(row['Disallowed by IRS']);
    }
    
    // Map quarterly wage data (19Q1-21Q4)
    ['19Q1', '19Q2', '19Q3', '19Q4', '20Q1', '20Q2', '20Q3', '20Q4', 
     '21Q1', '21Q2', '21Q3', '21Q4'].forEach(quarter => {
      if (row[quarter] !== undefined && row[quarter] !== '') {
        mapped[quarter] = this.parseDollarAmount(row[quarter]);
      }
    });
    
    // Map document links
    if (row['941x Link']) {
      mapped['form941x_files'] = row['941x Link'];
    }
    
    // Store original preparer if provided
    if (row['Service Description']) {
      mapped['original_preparer'] = row['Service Description'];
    }
    
    // Handle file date - use provided value or current date
    if (row['file date']) {
      mapped['file date'] = this.parseExcelDate(row['file date']);
      // Also map to filed_date for bulk upload field compatibility
      mapped['filed_date'] = mapped['file date'];
    } else {
      // Use current date if not provided
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();
      mapped['file date'] = `${month}/${day}/${year}`;
      // Also map to filed_date for bulk upload field compatibility
      mapped['filed_date'] = mapped['file date'];
    }
    
    // If Address and City, State, Zip are directly provided, use them (override parsed values)
    if (row['Address']) {
      mapped['Address'] = row['Address'];
    }
    if (row['City, State, Zip']) {
      mapped['City, State, Zip'] = row['City, State, Zip'];
    }
    
    // Add all other fields as custom metadata
    for (const [key, value] of Object.entries(row)) {
      if (!mapped[key] && value !== undefined && value !== null && value !== '') {
        // Store unmapped fields as-is for preservation
        mapped[key] = value;
      }
    }
    
    return mapped;
  }

  /**
   * Check if a row uses the custom format based on headers
   */
  static isCustomFormat(headers: string[]): boolean {
    // Check for distinctive custom headers
    const customIndicators = [
      'Customer Name/Business Name',
      'Customer EIN/TIN',
      'Customer Address (Full)',
      '2Q20 Amount',
      '941x Link'
    ];
    
    // Check both exact match and trimmed match to handle trailing spaces
    return customIndicators.some(indicator => 
      headers.includes(indicator) || 
      headers.some(h => h.trim() === indicator)
    );
  }

  /**
   * Generate template with custom headers (CSV format)
   */
  static generateCustomTemplate(): string {
    const headers = this.CUSTOM_HEADERS;
    
    // Sample data row matching the user's example
    const sampleRow = [
      "It's In The Box Logistics Inc", // Customer Name/Business Name
      "10ERC Advocate CFA 5 percent pre-signed.docx.pdf", // Filename
      "erc cfa agr/10ERC Advocate CFA 5 percent pre-signed.docx.pdf", // File Path
      new Date().toISOString(), // Processing Time
      "success", // Status
      "It's In The Box Logistics Inc", // Customer Name/Business Name (duplicate)
      "27-3760432", // Customer EIN/TIN
      "507 watercrest Circle, Elizabeth City NC 27909", // Customer Address (Full)
      "Wilburt Dudley", // Customer Contact Name
      "555-0100", // Customer Phone
      "dudley882@gmail.com", // Customer Email
      "07/03/2025", // Agreement Date
      "07/03/2025", // Effective Date
      "", // Termination Date
      "Consulting services related to tax credit benefits", // Service Description
      "", // Payment Percentage
      "upon receipt of Tax Benefit", // Payment Timeline
      "Consulting Fee Agreement", // Agreement Type
      "Consulting Fee Agreement", // Document Description
      "Wilburt Dudley", // Signatory Name (Customer)
      "Owner", // Signatory Title (Customer)
      "Sample data for testing", // Additional Notes
      "https://drive.google.com/drive/folders/example", // 941x Link
      "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit", // Proper Format Module (Google Sheets URL)
      "", // File Invite Link
      "", // 941x 2020 Q2
      "", // 941x 2020 Q3
      "", // 941x 2020 Q4
      "", // 941x 2021 Q1
      "", // 941x 2021 Q2
      "", // 941x 2021 Q3
      "", // 941x
      "", // 941x
      "302633.41", // Claim Total (number format for Excel)
      "Shutdown order/Supply Chain Disruption", // 2Q20 Qualification
      "49882.53", // 2Q20 Amount (number format for Excel)
      "Shutdown order/Supply Chain Disruption", // 3Q20 Qualification
      "10824.37", // 3Q20 Amount
      "Shutdown order/Supply Chain Disruption", // 4Q20 Qualification
      "10805.61", // 4Q20 Amount
      "Shutdown order/Supply Chain Disruption", // 1Q21 Qualification
      "95840.51", // 1Q21 Amount
      "Shutdown order/Supply Chain Disruption", // 2Q21 Qualification
      "101827.24", // 2Q21 Amount
      "Shutdown order/Supply Chain Disruption", // 3Q21 Qualification
      "33453.15", // 3Q21 Amount
      "N/A", // 4Q21 Qualification
      "0", // 4Q21 Amount
      "", // Refunded by IRS
      "", // Disallowed by IRS
      "27-3760432", // EIN
      "161331.57", // 19Q1
      "172080.08", // 19Q2
      "182007.35", // 19Q3
      "236433.07", // 19Q4
      "183674.12", // 20Q1
      "264618.08", // 20Q2
      "267249.70", // 20Q3
      "267249.77", // 20Q4
      "286828.86", // 21Q1
      "332991.53", // 21Q2
      "331545.06", // 21Q3
      "", // 21Q4
      "", // Link
      "", // Link
      "507 watercrest Circle", // Address (parsed from full address)
      "Elizabeth City, NC 27909", // City, State, Zip (parsed from full address)
      new Date().toLocaleDateString('en-US'), // file date (current date)
      "(555) 555-1234" // Contact Phone number (optional override for main phone)
    ];
    
    // Build CSV content
    const csvLines = [
      '# Custom Batch Upload Template - ERC Processing',
      '# REQUIRED: "Proper Format Module" column (Column X) must contain Google Sheets URL',
      '# Amounts: Use number format (e.g., 49882.53) for Excel or dollar format ($49,882.53) for CSV',
      '# Quarterly qualifications: Describe reason or use "N/A" if not qualified.',
      '',
      headers.map(h => `"${h}"`).join(','),
      sampleRow.map(cell => {
        const str = String(cell || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ];
    
    return csvLines.join('\n');
  }
  
  /**
   * Generate template in Excel format
   */
  static generateExcelTemplate(): Buffer {
    const XLSX = require('xlsx');
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Sample data matching the desiredtemplate.xlsx format
    const data = [
      this.CUSTOM_HEADERS,
      [
        "It's In The Box Logistics Inc",
        "10ERC Advocate CFA 5 percent pre-signed.docx.pdf",
        "erc cfa agr/10ERC Advocate CFA 5 percent pre-signed.docx.pdf",
        new Date().toISOString(),
        "success",
        "It's In The Box Logistics Inc",
        "27-3760432",
        "507 watercrest Circle, Elizabeth City NC 27909",
        "Wilburt Dudley",
        "555-0100",
        "dudley882@gmail.com",
        45841, // Excel date serial number for 07/03/2025
        45841,
        "",
        "Consulting services related to tax credit benefits",
        "",
        "upon receipt of Tax Benefit",
        "Consulting Fee Agreement",
        "Consulting Fee Agreement",
        "Wilburt Dudley",
        "Owner",
        "Sample data for testing",
        "https://drive.google.com/drive/folders/example",
        "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        302633.41,
        "Shutdown order/Supply Chain Disruption",
        49882.53,
        "Shutdown order/Supply Chain Disruption",
        10824.37,
        "Shutdown order/Supply Chain Disruption",
        10805.61,
        "Shutdown order/Supply Chain Disruption",
        95840.51,
        "Shutdown order/Supply Chain Disruption",
        101827.24,
        "Shutdown order/Supply Chain Disruption",
        33453.15,
        "N/A",
        0,
        "",
        "",
        "27-3760432",
        161331.57,
        172080.08,
        182007.35,
        236433.07,
        183674.12,
        264618.08,
        267249.70,
        267249.77,
        286828.86,
        332991.53,
        331545.06,
        "",
        "",
        "",
        "507 watercrest Circle", // Address
        "Elizabeth City, NC 27909", // City, State, Zip
        new Date().toLocaleDateString('en-US'), // file date
        "5555551234" // Contact Phone number (optional override for main phone)
      ]
    ];
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Batch Upload Template");
    
    // Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  }
}