// ERC Portal Export Configuration
// Defines the 51-field tab-delimited format for ERC portal uploads
// Each field has a specific mapping from the extracted data to the portal format

import { TransformedERCData } from '../services/dataTransformer';

export interface PortalField {
  fieldNumber: number;
  fieldName: string;
  description: string;
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'PERCENTAGE' | 'BOOLEAN';
  maxLength?: number;
  defaultValue?: string | number | boolean;
  required: boolean;
  // Function to generate the field value from transformed data
  generator: (data: TransformedERCData) => string;
}

// Helper function to generate case ID
const generateCaseId = (data: TransformedERCData): string => {
  const ein = data.companyInfo.ein?.replace(/-/g, '') || '';
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `ERC-${ein}-${timestamp}`;
};

// Helper function to format boolean as Y/N
const formatBoolean = (value: boolean | undefined): string => {
  return value ? 'Y' : 'N';
};

// Helper function to format date
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper function to format currency
const formatCurrency = (value: number | undefined): string => {
  return value ? value.toFixed(2) : '0.00';
};

// Helper function to format percentage
const formatPercentage = (value: number | undefined): string => {
  return value ? (value * 100).toFixed(2) : '0.00';
};

// Helper function to generate operational triggers description
const generateOperationalTriggers = (data: TransformedERCData): string => {
  const triggers: string[] = [];
  
  // Check shutdown standards for operational impacts
  const shutdown = data.shutdownStandards;
  
  if (shutdown.fullShutdowns) triggers.push('Full business shutdowns');
  if (shutdown.partialShutdowns) triggers.push('Partial business shutdowns');
  if (shutdown.interruptedOperations) triggers.push('Interrupted operations');
  if (shutdown.supplyChainInterruptions) triggers.push('Supply chain disruptions');
  if (shutdown.inabilityAccessEquipment) triggers.push('Unable to access equipment');
  if (shutdown.limitedCapacity) triggers.push('Limited operational capacity');
  if (shutdown.inabilityWorkVendors) triggers.push('Unable to work with vendors');
  if (shutdown.reductionServices) triggers.push('Reduction in services offered');
  if (shutdown.cutDownHours) triggers.push('Reduced business hours');
  if (shutdown.shiftingHoursSanitation) triggers.push('Shifted hours for sanitation');
  if (shutdown.challengesFindingEmployees) triggers.push('Challenges finding employees');
  
  // Add any specific comments
  if (shutdown.otherComments) {
    triggers.push(`Other: ${shutdown.otherComments}`);
  }
  
  return triggers.length > 0 ? triggers.join('; ') : 'No specific operational triggers reported';
};

// Helper function to generate hardship description
const generateHardshipDescription = (data: TransformedERCData): string => {
  const hardships: string[] = [];
  
  // Check for revenue reduction
  if (data.revenueReductionQuestions.reduction50_2020) {
    hardships.push('Experienced 50% or greater revenue reduction in 2020');
  }
  if (data.revenueReductionQuestions.reduction20_2021) {
    hardships.push('Experienced 20% or greater revenue reduction in 2021');
  }
  
  // Check qualifying questions for hardships
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
  const hasGovernmentShutdown = quarters.some(q => 
    data.qualifyingQuestions[2020][q].governmentShutdown || 
    (q !== 'Q4' && data.qualifyingQuestions[2021][q as 'Q1' | 'Q2' | 'Q3'].governmentShutdown)
  );
  
  if (hasGovernmentShutdown) {
    hardships.push('Subject to government shutdown orders');
  }
  
  // Add PPP information if relevant
  if (data.pppInformation.ppp1ForgivenessAmount > 0) {
    hardships.push(`Received PPP1 loan (forgiven: $${data.pppInformation.ppp1ForgivenessAmount.toFixed(2)})`);
  }
  if (data.pppInformation.ppp2ForgivenessAmount > 0) {
    hardships.push(`Received PPP2 loan (forgiven: $${data.pppInformation.ppp2ForgivenessAmount.toFixed(2)})`);
  }
  
  return hardships.length > 0 ? hardships.join('. ') : 'Business experienced COVID-19 related hardships';
};

// Helper function to calculate gross receipts decline percentage
const calculateDeclinePercentage = (baseline: number, current: number): string => {
  if (baseline === 0) return '0.00';
  const decline = ((baseline - current) / baseline) * 100;
  return decline.toFixed(2);
};

// ERC Portal field definitions (Fields 1-30)
export const ERC_PORTAL_FIELDS: PortalField[] = [
  {
    fieldNumber: 1,
    fieldName: 'CASE_ID',
    description: 'Unique case identifier',
    dataType: 'TEXT',
    maxLength: 50,
    required: true,
    generator: generateCaseId
  },
  {
    fieldNumber: 2,
    fieldName: 'EIN',
    description: 'Employer Identification Number',
    dataType: 'TEXT',
    maxLength: 10,
    required: true,
    generator: (data) => data.companyInfo.ein?.replace(/-/g, '') || ''
  },
  {
    fieldNumber: 3,
    fieldName: 'LEGAL_NAME',
    description: 'Company legal name',
    dataType: 'TEXT',
    maxLength: 100,
    required: true,
    generator: (data) => data.companyInfo.legalName || ''
  },
  {
    fieldNumber: 4,
    fieldName: 'TRADE_NAME',
    description: 'Company trade name/DBA',
    dataType: 'TEXT',
    maxLength: 100,
    required: false,
    generator: (data) => data.companyInfo.tradeName || ''
  },
  {
    fieldNumber: 5,
    fieldName: 'ADDRESS_LINE1',
    description: 'Street address',
    dataType: 'TEXT',
    maxLength: 100,
    required: true,
    generator: (data) => data.companyInfo.address.line1 || ''
  },
  {
    fieldNumber: 6,
    fieldName: 'CITY',
    description: 'City',
    dataType: 'TEXT',
    maxLength: 50,
    required: true,
    generator: (data) => data.companyInfo.address.city || ''
  },
  {
    fieldNumber: 7,
    fieldName: 'STATE',
    description: 'State code',
    dataType: 'TEXT',
    maxLength: 2,
    required: true,
    generator: (data) => data.companyInfo.address.state?.toUpperCase() || ''
  },
  {
    fieldNumber: 8,
    fieldName: 'ZIP',
    description: 'ZIP code',
    dataType: 'TEXT',
    maxLength: 10,
    required: true,
    generator: (data) => data.companyInfo.address.zip || ''
  },
  {
    fieldNumber: 9,
    fieldName: 'PHONE',
    description: 'Company phone number',
    dataType: 'TEXT',
    maxLength: 20,
    required: false,
    defaultValue: '',
    generator: () => '' // Not in source data
  },
  {
    fieldNumber: 10,
    fieldName: 'CONTACT_NAME',
    description: 'Primary contact name',
    dataType: 'TEXT',
    maxLength: 100,
    required: false,
    defaultValue: '',
    generator: () => '' // Not in source data
  },
  {
    fieldNumber: 11,
    fieldName: 'CONTACT_EMAIL',
    description: 'Primary contact email',
    dataType: 'TEXT',
    maxLength: 100,
    required: false,
    defaultValue: '',
    generator: () => '' // Not in source data
  },
  {
    fieldNumber: 12,
    fieldName: 'SUBMISSION_DATE',
    description: 'Date of submission',
    dataType: 'DATE',
    required: true,
    generator: () => formatDate(new Date())
  },
  {
    fieldNumber: 13,
    fieldName: 'TAX_YEAR_2020',
    description: 'Claiming for 2020',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => {
      // Check if any 2020 quarters have qualifying conditions
      const has2020 = Object.values(data.qualifyingQuestions[2020]).some(q => 
        q.governmentShutdown || q.supplyDisruptions || q.vendorDisruptions || 
        q.revenueReduction20Percent || q.recoveryStartupBusiness
      );
      return formatBoolean(has2020);
    }
  },
  {
    fieldNumber: 14,
    fieldName: 'TAX_YEAR_2021',
    description: 'Claiming for 2021',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => {
      // Check if any 2021 quarters have qualifying conditions
      const quarters = ['Q1', 'Q2', 'Q3'] as const;
      const has2021 = quarters.some(q => {
        const quarterData = data.qualifyingQuestions[2021][q];
        return quarterData.governmentShutdown || quarterData.supplyDisruptions || 
               quarterData.vendorDisruptions || quarterData.revenueReduction20Percent || 
               quarterData.recoveryStartupBusiness;
      });
      return formatBoolean(has2021);
    }
  },
  {
    fieldNumber: 15,
    fieldName: 'Q2_2020_CLAIM',
    description: 'Claiming Q2 2020',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(
      data.qualifyingQuestions[2020].Q2.governmentShutdown ||
      data.qualifyingQuestions[2020].Q2.supplyDisruptions ||
      data.qualifyingQuestions[2020].Q2.revenueReduction20Percent
    )
  },
  {
    fieldNumber: 16,
    fieldName: 'Q3_2020_CLAIM',
    description: 'Claiming Q3 2020',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(
      data.qualifyingQuestions[2020].Q3.governmentShutdown ||
      data.qualifyingQuestions[2020].Q3.supplyDisruptions ||
      data.qualifyingQuestions[2020].Q3.revenueReduction20Percent
    )
  },
  {
    fieldNumber: 17,
    fieldName: 'Q4_2020_CLAIM',
    description: 'Claiming Q4 2020',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(
      data.qualifyingQuestions[2020].Q4.governmentShutdown ||
      data.qualifyingQuestions[2020].Q4.supplyDisruptions ||
      data.qualifyingQuestions[2020].Q4.revenueReduction20Percent
    )
  },
  {
    fieldNumber: 18,
    fieldName: 'Q1_2021_CLAIM',
    description: 'Claiming Q1 2021',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(
      data.qualifyingQuestions[2021].Q1.governmentShutdown ||
      data.qualifyingQuestions[2021].Q1.supplyDisruptions ||
      data.qualifyingQuestions[2021].Q1.revenueReduction20Percent
    )
  },
  {
    fieldNumber: 19,
    fieldName: 'Q2_2021_CLAIM',
    description: 'Claiming Q2 2021',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(
      data.qualifyingQuestions[2021].Q2.governmentShutdown ||
      data.qualifyingQuestions[2021].Q2.supplyDisruptions ||
      data.qualifyingQuestions[2021].Q2.revenueReduction20Percent
    )
  },
  {
    fieldNumber: 20,
    fieldName: 'Q3_2021_CLAIM',
    description: 'Claiming Q3 2021',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(
      data.qualifyingQuestions[2021].Q3.governmentShutdown ||
      data.qualifyingQuestions[2021].Q3.supplyDisruptions ||
      data.qualifyingQuestions[2021].Q3.revenueReduction20Percent
    )
  },
  {
    fieldNumber: 21,
    fieldName: 'INDUSTRY_CODE',
    description: 'NAICS industry code',
    dataType: 'TEXT',
    maxLength: 10,
    required: false,
    defaultValue: '',
    generator: () => '' // Not extracted in current implementation
  },
  {
    fieldNumber: 22,
    fieldName: 'BUSINESS_START_DATE',
    description: 'Date business started',
    dataType: 'DATE',
    required: false,
    defaultValue: '',
    generator: () => '' // Not in source data
  },
  {
    fieldNumber: 23,
    fieldName: 'EMPLOYEE_COUNT_2019',
    description: 'Average employee count 2019',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => String(data.companyInfo.fullTimeW2Count2019 || 0)
  },
  {
    fieldNumber: 24,
    fieldName: 'EMPLOYEE_COUNT_2020',
    description: 'Average employee count 2020',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => String(data.companyInfo.fullTimeW2Count2020 || 0)
  },
  {
    fieldNumber: 25,
    fieldName: 'EMPLOYEE_COUNT_2021',
    description: 'Average employee count 2021',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => String(data.companyInfo.fullTimeW2Count2021 || 0)
  },
  {
    fieldNumber: 26,
    fieldName: 'GROSS_RECEIPTS_2019_Q1',
    description: '2019 Q1 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2019].Q1)
  },
  {
    fieldNumber: 27,
    fieldName: 'GROSS_RECEIPTS_2019_Q2',
    description: '2019 Q2 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2019].Q2)
  },
  {
    fieldNumber: 28,
    fieldName: 'GROSS_RECEIPTS_2019_Q3',
    description: '2019 Q3 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2019].Q3)
  },
  {
    fieldNumber: 29,
    fieldName: 'GROSS_RECEIPTS_2019_Q4',
    description: '2019 Q4 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2019].Q4)
  },
  {
    fieldNumber: 30,
    fieldName: 'GROSS_RECEIPTS_2020_Q1',
    description: '2020 Q1 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2020].Q1)
  },
  // Fields 31-51
  {
    fieldNumber: 31,
    fieldName: 'GROSS_RECEIPTS_2020_Q2',
    description: '2020 Q2 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2020].Q2)
  },
  {
    fieldNumber: 32,
    fieldName: 'GROSS_RECEIPTS_2020_Q3',
    description: '2020 Q3 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2020].Q3)
  },
  {
    fieldNumber: 33,
    fieldName: 'GROSS_RECEIPTS_2020_Q4',
    description: '2020 Q4 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2020].Q4)
  },
  {
    fieldNumber: 34,
    fieldName: 'GROSS_RECEIPTS_2021_Q1',
    description: '2021 Q1 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2021].Q1)
  },
  {
    fieldNumber: 35,
    fieldName: 'GROSS_RECEIPTS_2021_Q2',
    description: '2021 Q2 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2021].Q2)
  },
  {
    fieldNumber: 36,
    fieldName: 'GROSS_RECEIPTS_2021_Q3',
    description: '2021 Q3 gross receipts',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => formatCurrency(data.grossReceipts[2021].Q3)
  },
  {
    fieldNumber: 37,
    fieldName: 'GROSS_RECEIPTS_2021_Q4',
    description: '2021 Q4 gross receipts',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => formatCurrency(data.grossReceipts[2021].Q4)
  },
  {
    fieldNumber: 38,
    fieldName: 'PPP1_LOAN_AMOUNT',
    description: 'PPP1 loan amount',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => formatCurrency(data.pppInformation.ppp1ForgivenessAmount)
  },
  {
    fieldNumber: 39,
    fieldName: 'PPP1_FORGIVENESS_AMOUNT',
    description: 'PPP1 forgiveness amount',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => formatCurrency(data.pppInformation.ppp1ForgivenessAmount)
  },
  {
    fieldNumber: 40,
    fieldName: 'PPP2_LOAN_AMOUNT',
    description: 'PPP2 loan amount',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => formatCurrency(data.pppInformation.ppp2ForgivenessAmount)
  },
  {
    fieldNumber: 41,
    fieldName: 'PPP2_FORGIVENESS_AMOUNT',
    description: 'PPP2 forgiveness amount',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => formatCurrency(data.pppInformation.ppp2ForgivenessAmount)
  },
  {
    fieldNumber: 42,
    fieldName: 'OWNER_NAME_1',
    description: 'Primary owner name',
    dataType: 'TEXT',
    maxLength: 100,
    required: false,
    generator: (data) => data.ownershipStructure.ownerName || ''
  },
  {
    fieldNumber: 43,
    fieldName: 'OWNER_PERCENTAGE_1',
    description: 'Primary owner percentage',
    dataType: 'PERCENTAGE',
    required: false,
    generator: (data) => {
      const pct = data.ownershipStructure.ownerPercentage;
      if (typeof pct === 'boolean') return pct ? '100.00' : '0.00';
      return formatPercentage(pct / 100); // Convert to decimal for percentage formatting
    }
  },
  {
    fieldNumber: 44,
    fieldName: 'OPERATIONAL_TRIGGERS',
    description: 'Description of operational triggers',
    dataType: 'TEXT',
    maxLength: 1000,
    required: true,
    generator: generateOperationalTriggers
  },
  {
    fieldNumber: 45,
    fieldName: 'HARDSHIP_DESCRIPTION',
    description: 'Description of COVID-19 hardships',
    dataType: 'TEXT',
    maxLength: 1000,
    required: true,
    generator: generateHardshipDescription
  },
  {
    fieldNumber: 46,
    fieldName: 'REVENUE_DECLINE_Q2_2020',
    description: 'Revenue decline percentage Q2 2020 vs Q2 2019',
    dataType: 'PERCENTAGE',
    required: false,
    generator: (data) => calculateDeclinePercentage(
      data.grossReceipts[2019].Q2,
      data.grossReceipts[2020].Q2
    )
  },
  {
    fieldNumber: 47,
    fieldName: 'REVENUE_DECLINE_Q3_2020',
    description: 'Revenue decline percentage Q3 2020 vs Q3 2019',
    dataType: 'PERCENTAGE',
    required: false,
    generator: (data) => calculateDeclinePercentage(
      data.grossReceipts[2019].Q3,
      data.grossReceipts[2020].Q3
    )
  },
  {
    fieldNumber: 48,
    fieldName: 'REVENUE_DECLINE_Q4_2020',
    description: 'Revenue decline percentage Q4 2020 vs Q4 2019',
    dataType: 'PERCENTAGE',
    required: false,
    generator: (data) => calculateDeclinePercentage(
      data.grossReceipts[2019].Q4,
      data.grossReceipts[2020].Q4
    )
  },
  {
    fieldNumber: 49,
    fieldName: 'REVENUE_DECLINE_Q1_2021',
    description: 'Revenue decline percentage Q1 2021 vs Q1 2019',
    dataType: 'PERCENTAGE',
    required: false,
    generator: (data) => calculateDeclinePercentage(
      data.grossReceipts[2019].Q1,
      data.grossReceipts[2021].Q1
    )
  },
  {
    fieldNumber: 50,
    fieldName: 'RECOVERY_STARTUP_BUSINESS',
    description: 'Is recovery startup business',
    dataType: 'BOOLEAN',
    required: false,
    generator: (data) => {
      // Check if any quarter marked as recovery startup
      const isRecoveryStartup = Object.values(data.qualifyingQuestions[2020]).some(q => q.recoveryStartupBusiness) ||
        ['Q1', 'Q2', 'Q3'].some(q => data.qualifyingQuestions[2021][q as 'Q1' | 'Q2' | 'Q3'].recoveryStartupBusiness);
      return formatBoolean(isRecoveryStartup);
    }
  },
  {
    fieldNumber: 51,
    fieldName: 'PROCESSING_STATUS',
    description: 'Current processing status',
    dataType: 'TEXT',
    maxLength: 50,
    required: true,
    defaultValue: 'PENDING',
    generator: () => 'PENDING'
  }
];

// Export helper to get all fields (1-51)
export function getAllPortalFields(): PortalField[] {
  return ERC_PORTAL_FIELDS;
}

// Export helper to get field by number
export function getPortalFieldByNumber(fieldNumber: number): PortalField | undefined {
  return ERC_PORTAL_FIELDS.find(f => f.fieldNumber === fieldNumber);
}

// Export helper to validate portal data
export function validatePortalData(data: TransformedERCData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of ERC_PORTAL_FIELDS) {
    if (field.required) {
      try {
        const value = field.generator(data);
        if (!value || value.trim() === '') {
          errors.push(`Field ${field.fieldNumber} (${field.fieldName}) is required but empty`);
        }
        if (field.maxLength && value.length > field.maxLength) {
          errors.push(`Field ${field.fieldNumber} (${field.fieldName}) exceeds max length of ${field.maxLength}`);
        }
      } catch (error) {
        errors.push(`Error generating field ${field.fieldNumber} (${field.fieldName}): ${error}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}