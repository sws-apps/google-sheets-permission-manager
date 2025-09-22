// ERC Bulk Upload Mapper Service
// Transforms extracted ERC data into CSV format for customer bulk uploads

import { TransformedERCData } from './dataTransformer';
import { getAllBulkUploadFields, BulkUploadField } from '../config/ercBulkUploadConfig';

export interface BulkUploadExportResult {
  success: boolean;
  data?: string; // CSV string
  headers?: string; // CSV headers
  errors?: string[];
  fieldCount?: number;
  rowData?: string[]; // Array of field values for debugging
}

export class ERCBulkUploadMapper {
  /**
   * Generate a single row of data for bulk upload (used in batch processing)
   */
  static generateBulkUploadRow(ercData: TransformedERCData): string[] {
    const bulkUploadFields = getAllBulkUploadFields();
    const rowData: string[] = [];
    
    for (const field of bulkUploadFields) {
      try {
        const value = field.generator(ercData);
        rowData.push(value);
      } catch (error) {
        // Use default value if generation fails
        const defaultValue = field.defaultValue || '';
        rowData.push(defaultValue);
      }
    }
    
    return rowData;
  }
  
  /**
   * Get headers for bulk upload CSV
   */
  static getHeaders(): string[] {
    const bulkUploadFields = getAllBulkUploadFields();
    return bulkUploadFields.map(field => field.fieldName);
  }
  
  /**
   * Transform ERC data into bulk upload CSV format
   */
  static transformToBulkUploadFormat(ercData: TransformedERCData): BulkUploadExportResult {
    try {
      // Get all bulk upload fields
      const bulkUploadFields = getAllBulkUploadFields();
      
      // Generate headers (field names)
      const headers = bulkUploadFields.map(field => field.fieldName).join(',');
      
      // Generate data row
      const rowData: string[] = [];
      const errors: string[] = [];
      
      for (const field of bulkUploadFields) {
        try {
          const value = field.generator(ercData);
          // Escape values that contain commas or quotes
          const escapedValue = this.escapeCSVValue(value);
          rowData.push(escapedValue);
        } catch (error) {
          console.error(`Error generating field ${field.fieldNumber} (${field.fieldName}):`, error);
          // Use default value if available, otherwise empty string
          const defaultValue = field.defaultValue || '';
          rowData.push(this.escapeCSVValue(defaultValue));
          errors.push(`Field ${field.fieldNumber} (${field.fieldName}): Used default value`);
        }
      }
      
      // Join with commas for CSV format
      const dataRow = rowData.join(',');
      
      // Combine headers and data
      const fullExport = `${headers}\n${dataRow}`;
      
      return {
        success: true,
        data: fullExport,
        headers,
        errors: errors.length > 0 ? errors : undefined,
        fieldCount: bulkUploadFields.length,
        rowData // Include for debugging
      };
    } catch (error) {
      console.error('Bulk upload transformation failed:', error);
      return {
        success: false,
        errors: [`Bulk upload transformation failed: ${error}`]
      };
    }
  }

  /**
   * Escape CSV values that contain special characters
   */
  private static escapeCSVValue(value: string): string {
    // Convert to string if not already
    const strValue = String(value || '');
    
    // Check if value needs escaping
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n') || strValue.includes('\r')) {
      // Escape quotes by doubling them
      const escaped = strValue.replace(/"/g, '""');
      // Wrap in quotes
      return `"${escaped}"`;
    }
    
    return strValue;
  }

  /**
   * Generate bulk upload export as a file buffer
   */
  static generateBulkUploadFile(ercData: TransformedERCData): Buffer | null {
    const result = this.transformToBulkUploadFormat(ercData);
    
    if (!result.success || !result.data) {
      return null;
    }
    
    // Create buffer from the CSV string
    return Buffer.from(result.data, 'utf-8');
  }

  /**
   * Get bulk upload field summary for documentation
   */
  static getFieldSummary(): Array<{ number: number; name: string; description: string; required: boolean }> {
    const fields = getAllBulkUploadFields();
    return fields.map(field => ({
      number: field.fieldNumber,
      name: field.fieldName,
      description: field.description,
      required: field.required
    }));
  }

  /**
   * Generate a preview of the bulk upload export (first N fields)
   */
  static generatePreview(ercData: TransformedERCData, fieldCount: number = 10): BulkUploadExportResult {
    try {
      const allFields = getAllBulkUploadFields();
      const previewFields = allFields.slice(0, fieldCount);
      
      // Generate headers
      const headers = previewFields.map(field => field.fieldName).join(',');
      
      // Generate preview data
      const rowData: string[] = [];
      
      for (const field of previewFields) {
        try {
          const value = field.generator(ercData);
          rowData.push(this.escapeCSVValue(value));
        } catch (error) {
          const defaultValue = field.defaultValue || '';
          rowData.push(this.escapeCSVValue(defaultValue));
        }
      }
      
      const dataRow = rowData.join(',');
      const fullExport = `${headers}\n${dataRow}\n... (${allFields.length - fieldCount} more fields)`;
      
      return {
        success: true,
        data: fullExport,
        headers,
        fieldCount: allFields.length,
        rowData
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Preview generation failed: ${error}`]
      };
    }
  }

  /**
   * Validate that all required source data exists
   */
  static validateSourceData(ercData: TransformedERCData): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    // Check company info
    if (!ercData?.companyInfo?.ein) missing.push('Company EIN');
    if (!ercData?.companyInfo?.legalName) missing.push('Company Legal Name');
    if (!ercData?.companyInfo?.address?.line1) missing.push('Address Line 1');
    if (!ercData?.companyInfo?.address?.city) missing.push('City');
    if (!ercData?.companyInfo?.address?.state) missing.push('State');
    if (!ercData?.companyInfo?.address?.zip) missing.push('ZIP Code');
    
    // Check employee counts
    if (ercData?.companyInfo?.fullTimeW2Count2019 === undefined) missing.push('2019 Employee Count');
    if (ercData?.companyInfo?.fullTimeW2Count2020 === undefined) missing.push('2020 Employee Count');
    if (ercData?.companyInfo?.fullTimeW2Count2021 === undefined) missing.push('2021 Employee Count');
    
    // Check gross receipts
    const years = [2019, 2020, 2021] as const;
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
    
    for (const year of years) {
      for (const quarter of quarters) {
        if (!ercData?.grossReceipts?.[year] || ercData.grossReceipts[year][quarter] === undefined) {
          missing.push(`${year} ${quarter} Gross Receipts`);
        }
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Generate field mapping documentation
   */
  static generateMappingDocumentation(): string {
    const fields = getAllBulkUploadFields();
    let doc = '# ERC Bulk Upload Field Mapping Documentation\n\n';
    doc += `Total Fields: ${fields.length}\n\n`;
    doc += '| Field # | Field Name | Description | Type | Required |\n';
    doc += '|---------|------------|-------------|------|----------|\n';
    
    for (const field of fields) {
      doc += `| ${field.fieldNumber} | ${field.fieldName} | ${field.description} | ${field.dataType} | ${field.required ? 'Yes' : 'No'} |\n`;
    }
    
    return doc;
  }
}