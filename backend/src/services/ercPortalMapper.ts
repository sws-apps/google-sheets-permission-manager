// ERC Portal Mapper Service
// Transforms extracted ERC data into tab-delimited format for portal uploads

import { TransformedERCData } from './dataTransformer';
import { getAllPortalFields, validatePortalData, PortalField } from '../config/ercPortalConfig';

export interface PortalExportResult {
  success: boolean;
  data?: string; // Tab-delimited string
  headers?: string; // Tab-delimited headers
  errors?: string[];
  fieldCount?: number;
  rowData?: string[]; // Array of field values for debugging
}

export class ERCPortalMapper {
  /**
   * Transform ERC data into portal format
   */
  static transformToPortalFormat(ercData: TransformedERCData): PortalExportResult {
    try {
      // Validate the data first
      const validation = validatePortalData(ercData);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get all portal fields
      const portalFields = getAllPortalFields();
      
      // Generate headers (field names)
      const headers = portalFields.map(field => field.fieldName).join('\t');
      
      // Generate data row
      const rowData: string[] = [];
      const errors: string[] = [];
      
      for (const field of portalFields) {
        try {
          const value = field.generator(ercData);
          // Ensure no tabs in the data (would break tab-delimited format)
          const cleanValue = value.replace(/\t/g, ' ').trim();
          rowData.push(cleanValue);
        } catch (error) {
          errors.push(`Error generating field ${field.fieldNumber} (${field.fieldName}): ${error}`);
          rowData.push(''); // Add empty value to maintain field alignment
        }
      }
      
      // Join with tabs for tab-delimited format
      const dataRow = rowData.join('\t');
      
      // Combine headers and data
      const fullExport = `${headers}\n${dataRow}`;
      
      return {
        success: errors.length === 0,
        data: fullExport,
        headers,
        errors: errors.length > 0 ? errors : undefined,
        fieldCount: portalFields.length,
        rowData // Include for debugging
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Portal transformation failed: ${error}`]
      };
    }
  }

  /**
   * Generate portal export as a file buffer
   */
  static generatePortalFile(ercData: TransformedERCData): Buffer | null {
    const result = this.transformToPortalFormat(ercData);
    
    if (!result.success || !result.data) {
      return null;
    }
    
    // Create buffer from the tab-delimited string
    return Buffer.from(result.data, 'utf-8');
  }

  /**
   * Get portal field summary for documentation
   */
  static getFieldSummary(): Array<{ number: number; name: string; description: string; required: boolean }> {
    const fields = getAllPortalFields();
    return fields.map(field => ({
      number: field.fieldNumber,
      name: field.fieldName,
      description: field.description,
      required: field.required
    }));
  }

  /**
   * Generate a preview of the portal export (first N fields)
   */
  static generatePreview(ercData: TransformedERCData, fieldCount: number = 10): PortalExportResult {
    try {
      const allFields = getAllPortalFields();
      const previewFields = allFields.slice(0, fieldCount);
      
      // Generate headers
      const headers = previewFields.map(field => field.fieldName).join('\t');
      
      // Generate preview data
      const rowData: string[] = [];
      
      for (const field of previewFields) {
        try {
          const value = field.generator(ercData);
          rowData.push(value.replace(/\t/g, ' ').trim());
        } catch (error) {
          rowData.push('');
        }
      }
      
      const dataRow = rowData.join('\t');
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
    const fields = getAllPortalFields();
    let doc = '# ERC Portal Field Mapping Documentation\n\n';
    doc += `Total Fields: ${fields.length}\n\n`;
    doc += '| Field # | Field Name | Description | Type | Required | Source |\n';
    doc += '|---------|------------|-------------|------|----------|--------|\n';
    
    for (const field of fields) {
      const source = this.getFieldSource(field);
      doc += `| ${field.fieldNumber} | ${field.fieldName} | ${field.description} | ${field.dataType} | ${field.required ? 'Yes' : 'No'} | ${source} |\n`;
    }
    
    return doc;
  }

  /**
   * Get the source path for a field (for documentation)
   */
  private static getFieldSource(field: PortalField): string {
    // Analyze the generator function to determine source
    const generatorStr = field.generator.toString();
    
    if (generatorStr.includes('companyInfo.ein')) return 'Company Info → EIN';
    if (generatorStr.includes('companyInfo.legalName')) return 'Company Info → Legal Name';
    if (generatorStr.includes('companyInfo.tradeName')) return 'Company Info → Trade Name';
    if (generatorStr.includes('companyInfo.address')) return 'Company Info → Address';
    if (generatorStr.includes('fullTimeW2Count')) return 'Company Info → Employee Count';
    if (generatorStr.includes('grossReceipts')) return 'Gross Receipts Data';
    if (generatorStr.includes('qualifyingQuestions')) return 'Qualifying Questions';
    if (generatorStr.includes('generateCaseId')) return 'Generated (EIN + Date)';
    if (generatorStr.includes('new Date()')) return 'Current Date';
    if (field.defaultValue !== undefined) return 'Default/Not Available';
    
    return 'Custom Logic';
  }
}