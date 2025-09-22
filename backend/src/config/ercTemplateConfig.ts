// ERC Template Configuration
// Defines the cell mapping for the "It's In The Box Logistics Inc" Excel template
// Based on actual Excel file structure analysis

export interface CellMapping {
  cell: string;
  sheet?: string; // Optional sheet name, defaults to main sheet
  mappingType: 'TEMPLATE_LABEL' | 'DATA_VALUE' | 'HEADER';
  dataType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'PERCENTAGE';
  fieldName: string;
  description?: string;
}

export interface TemplateSection {
  name: string;
  mappings: CellMapping[];
}

export const ERC_TEMPLATE_CONFIG: {
  sheets: {
    main: string;
    dataDump: string;
    form941: string;
  };
  sections: TemplateSection[];
} = {
  sheets: {
    main: 'Understandable Data-final',
    dataDump: 'Data Dump',
    form941: '941 form'
  },
  sections: [
    {
      name: 'filerRemarks',
      mappings: [
        { cell: 'A2', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'filerRemarks', description: 'Company remarks and notes' }
      ]
    },
    {
      name: 'companyBasicInfo',
      mappings: [
        { cell: 'B25', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'companyEIN', description: 'Employer Identification Number' },
        { cell: 'B26', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'companyName', description: 'Company Legal Name' },
        { cell: 'B27', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'tradeName', description: 'Company Trade Name' },
        { cell: 'B28', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'addressLine1', description: 'Company Address Line 1' },
        { cell: 'B29', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'addressCity', description: 'Company City' },
        { cell: 'C29', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'addressState', description: 'Company State' },
        { cell: 'D29', sheet: 'Data Dump', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'addressZip', description: 'Company ZIP Code' }
      ]
    },
    {
      name: 'qualifyingQuestions',
      mappings: [
        // Headers
        { cell: 'A8', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'qualifyingQuestionsHeader' },
        { cell: 'B8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q1_2020' },
        { cell: 'C8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q2_2020' },
        { cell: 'D8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q3_2020' },
        { cell: 'E8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q4_2020' },
        { cell: 'F8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q1_2021' },
        { cell: 'G8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q2_2021' },
        { cell: 'H8', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'q3_2021' },
        
        // Government shutdowns - Row 9
        { cell: 'A9', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'governmentShutdownQuestion' },
        { cell: 'B9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q1_2020' },
        { cell: 'C9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q2_2020' },
        { cell: 'D9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q3_2020' },
        { cell: 'E9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q4_2020' },
        { cell: 'F9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q1_2021' },
        { cell: 'G9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q2_2021' },
        { cell: 'H9', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shutdown_q3_2021' },
        
        // Inability to conduct meetings face to face - Row 10
        { cell: 'A10', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'inabilityToMeetQuestion' },
        { cell: 'B10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q1_2020' },
        { cell: 'C10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q2_2020' },
        { cell: 'D10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q3_2020' },
        { cell: 'E10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q4_2020' },
        { cell: 'F10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q1_2021' },
        { cell: 'G10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q2_2021' },
        { cell: 'H10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'meetings_q3_2021' },
        
        // Supply chain disruptions - Row 11
        { cell: 'A11', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'supplyChainDisruptionQuestion' },
        { cell: 'B11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q1_2020' },
        { cell: 'C11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q2_2020' },
        { cell: 'D11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q3_2020' },
        { cell: 'E11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q4_2020' },
        { cell: 'F11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q1_2021' },
        { cell: 'G11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q2_2021' },
        { cell: 'H11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q3_2021' },
        
        // Vendor/supplier disruptions - Row 12
        { cell: 'A12', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'vendorDisruptionQuestion' },
        { cell: 'B12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q1_2020' },
        { cell: 'C12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q2_2020' },
        { cell: 'D12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q3_2020' },
        { cell: 'E12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q4_2020' },
        { cell: 'F12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q1_2021' },
        { cell: 'G12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q2_2021' },
        { cell: 'H12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'vendor_q3_2021' },
        
        // Recovery startup - Row 13
        { cell: 'A13', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'recoveryStartupQuestion' },
        { cell: 'B13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q1_2020' },
        { cell: 'C13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q2_2020' },
        { cell: 'D13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q3_2020' },
        { cell: 'E13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q4_2020' },
        { cell: 'F13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q1_2021' },
        { cell: 'G13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q2_2021' },
        { cell: 'H13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q3_2021' }
      ]
    },
    {
      name: 'revenueReductionQuestions',
      mappings: [
        // 50% reduction in 2020
        { cell: 'A15', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'reduction50_2020_question' },
        { cell: 'B15', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction50_2020' },
        
        // 20% reduction in 2021
        { cell: 'A16', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'reduction20_2021_question' },
        { cell: 'B16', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_2021' },
        
        // Own other business
        { cell: 'A17', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'ownOtherBusinessQuestion' },
        { cell: 'B17', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'ownOtherBusiness' }
      ]
    },
    {
      name: 'shutdownStandards',
      mappings: [
        { cell: 'A20', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'shutdownStandardsQuestion' },
        { cell: 'B20', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'shutdownStandardsAnswerHeader' },
        
        { cell: 'A21', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'fullShutdownsLabel' },
        { cell: 'B21', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'fullShutdowns' },
        
        { cell: 'A22', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'partialShutdownsLabel' },
        { cell: 'B22', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'partialShutdowns' },
        
        { cell: 'A23', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'interruptedOperationsLabel' },
        { cell: 'B23', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'interruptedOperations' },
        
        { cell: 'A24', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'supplyChainInterruptionsLabel' },
        { cell: 'B24', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supplyChainInterruptions' },
        
        { cell: 'A25', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'inabilityAccessEquipmentLabel' },
        { cell: 'B25', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'inabilityAccessEquipment' },
        
        { cell: 'A26', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'limitedCapacityLabel' },
        { cell: 'B26', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'limitedCapacity' },
        
        { cell: 'A27', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'inabilityWorkVendorsLabel' },
        { cell: 'B27', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'inabilityWorkVendors' },
        
        { cell: 'A28', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'reductionServicesLabel' },
        { cell: 'B28', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reductionServices' },
        
        { cell: 'A29', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'cutDownHoursLabel' },
        { cell: 'B29', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'cutDownHours' },
        
        { cell: 'A30', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'shiftingHoursSanitationLabel' },
        { cell: 'B30', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'shiftingHoursSanitation' },
        
        { cell: 'A31', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'challengesFindingEmployeesLabel' },
        { cell: 'B31', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'challengesFindingEmployees' },
        
        { cell: 'A32', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'shutdownOtherLabel' },
        { cell: 'B32', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'shutdownOtherComments' }
      ]
    },
    {
      name: 'salesAndEmployeeData',
      mappings: [
        // 2019 Data
        { cell: 'B38', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2019_q1', description: '2019 Q1 Business Gross Sales' },
        { cell: 'C38', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2019_q2', description: '2019 Q2 Business Gross Sales' },
        { cell: 'D38', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2019_q3', description: '2019 Q3 Business Gross Sales' },
        { cell: 'E38', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2019_q4', description: '2019 Q4 Business Gross Sales' },
        { cell: 'F38', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2019_total', description: '2019 Total Business Gross Sales' },
        { cell: 'F39', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'fullTimeW2Count2019', description: '2019 Full-time W2 employees' },
        
        // 2020 Data
        { cell: 'B44', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2020_q1', description: '2020 Q1 Business Gross Sales' },
        { cell: 'C44', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2020_q2', description: '2020 Q2 Business Gross Sales' },
        { cell: 'D44', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2020_q3', description: '2020 Q3 Business Gross Sales' },
        { cell: 'E44', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2020_q4', description: '2020 Q4 Business Gross Sales' },
        { cell: 'F44', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2020_total', description: '2020 Total Business Gross Sales' },
        { cell: 'F45', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'fullTimeW2Count2020', description: '2020 Full-time W2 employees' },
        
        // 2021 Data
        { cell: 'B49', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2021_q1', description: '2021 Q1 Business Gross Sales' },
        { cell: 'C49', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2021_q2', description: '2021 Q2 Business Gross Sales' },
        { cell: 'D49', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2021_q3', description: '2021 Q3 Business Gross Sales' },
        { cell: 'E49', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2021_q4', description: '2021 Q4 Business Gross Sales' },
        { cell: 'F49', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_receipts_2021_total', description: '2021 Total Business Gross Sales' },
        { cell: 'F50', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'fullTimeW2Count2021', description: '2021 Full-time W2 employees' }
      ]
    },
    {
      name: 'pppInformation',
      mappings: [
        { cell: 'A53', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'ppp1ObtainedLabel' },
        { cell: 'A54', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'ppp1ForgivenessLabel' },
        { cell: 'B54', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'ppp1ForgivenessAmount', description: 'PPP 1 Forgiveness Amount' },
        
        { cell: 'A57', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'ppp2ObtainedLabel' },
        { cell: 'A58', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'ppp2ForgivenessLabel' },
        { cell: 'B58', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'ppp2ForgivenessAmount', description: 'PPP 2 Forgiveness Amount' },
        
        // Additional PPP-related fields (these are labels, actual values not present in template)
        { cell: 'D56', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'pppLoanDateLabel', description: 'PPP Loan Date Label' },
        { cell: 'D58', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'naicsCodeLabel', description: 'NAICS Industry Code Label' }
      ]
    },
    {
      name: 'ownershipStructure',
      mappings: [
        { cell: 'A63', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'ownerNameHeader' },
        { cell: 'B63', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'ownerPercentageHeader' },
        { cell: 'A64', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'ownerName', description: 'Owner Name' },
        { cell: 'B64', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'ownerPercentage', description: 'Ownership Percentage' }
      ]
    },
    {
      name: 'form941QuarterlyData',
      mappings: [
        // Employee counts by quarter (Row 11)
        { cell: 'D11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q1_2020', description: 'Q1 2020 Employee Count' },
        { cell: 'E11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q2_2020', description: 'Q2 2020 Employee Count' },
        { cell: 'F11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q3_2020', description: 'Q3 2020 Employee Count' },
        { cell: 'G11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q4_2020', description: 'Q4 2020 Employee Count' },
        { cell: 'H11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q1_2021', description: 'Q1 2021 Employee Count' },
        { cell: 'I11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q2_2021', description: 'Q2 2021 Employee Count' },
        { cell: 'J11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q3_2021', description: 'Q3 2021 Employee Count' },
        { cell: 'K11', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'employeeCount_q4_2021', description: 'Q4 2021 Employee Count' },
        
        // Taxable Social Security Wages by quarter (Row 12)
        { cell: 'D12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q1_2020', description: 'Q1 2020 Taxable Social Security Wages' },
        { cell: 'E12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q2_2020', description: 'Q2 2020 Taxable Social Security Wages' },
        { cell: 'F12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q3_2020', description: 'Q3 2020 Taxable Social Security Wages' },
        { cell: 'G12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q4_2020', description: 'Q4 2020 Taxable Social Security Wages' },
        { cell: 'H12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q1_2021', description: 'Q1 2021 Taxable Social Security Wages' },
        { cell: 'I12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q2_2021', description: 'Q2 2021 Taxable Social Security Wages' },
        { cell: 'J12', sheet: '941 form', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'taxableSocSecWages_q3_2021', description: 'Q3 2021 Taxable Social Security Wages' },
        
        // Employee Retention Credit fields
        { cell: 'A13', sheet: '941 form', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'nonrefundableRetentionCreditLabel', description: 'Nonrefundable portion of employee retention credit' },
        { cell: 'A14', sheet: '941 form', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'refundableRetentionCreditLabel', description: 'Refundable portion of employee retention credit' },
        { cell: 'A15', sheet: '941 form', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'qualifiedWagesLabel', description: 'Qualified wages for the employee retention credit' }
      ]
    }
  ]
};

/**
 * Get all DATA_VALUE mappings for validation purposes
 */
export function getDataValueMappings(): CellMapping[] {
  const mappings: CellMapping[] = [];
  
  for (const section of ERC_TEMPLATE_CONFIG.sections) {
    for (const mapping of section.mappings) {
      if (mapping.mappingType === 'DATA_VALUE') {
        mappings.push(mapping);
      }
    }
  }
  
  return mappings;
}

/**
 * Get mappings by section name
 */
export function getMappingsBySection(sectionName: string): CellMapping[] {
  const section = ERC_TEMPLATE_CONFIG.sections.find(s => s.name === sectionName);
  return section ? section.mappings : [];
}

/**
 * Get a mapping by field name
 */
export function getMappingByFieldName(fieldName: string): CellMapping | undefined {
  for (const section of ERC_TEMPLATE_CONFIG.sections) {
    const mapping = section.mappings.find(m => m.fieldName === fieldName);
    if (mapping) return mapping;
  }
  return undefined;
}