// ERC Bulk Upload Configuration
// Defines the 52-field CSV format for customer bulk upload
// Based on "customer bulk upload test 1.xlsx" template

import { TransformedERCData } from '../services/dataTransformer';

export interface BulkUploadField {
  fieldNumber: number;
  fieldName: string;
  description: string;
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'COMPLEX';
  required: boolean;
  defaultValue?: string;
  generator: (data: TransformedERCData) => string;
}

// Helper functions
const getCompanyInitials = (name: string | undefined): string => {
  if (!name) return 'UNK';
  
  // Extract capital letters or first letters of significant words
  const words = name.split(/\s+/);
  const significantWords = words.filter(w => 
    w.length > 0 && 
    !['Inc', 'Inc.', 'LLC', 'Corp', 'Corporation', 'Ltd', 'Limited', 'Co', 'Company', 'LP', 'LLP', 'PC'].includes(w)
  );
  
  // Generate initials from significant words
  let initials = '';
  
  if (significantWords.length === 1) {
    // For single word, take first 3 letters (e.g., "Microsoft" → "MIC")
    initials = significantWords[0].substring(0, 3).toUpperCase();
  } else if (significantWords.length === 2) {
    // For two words, take first letter of each (e.g., "Sample Company" → "SC")
    initials = significantWords.map(w => w[0].toUpperCase()).join('');
  } else if (significantWords.length >= 3) {
    // For three or more words, take first letter of first 3 words (e.g., "GOM Holdings Inc" → "GOM")
    initials = significantWords.slice(0, 3).map(w => w[0].toUpperCase()).join('');
  }
  
  // Ensure we have at least 2 characters and max 3
  if (initials.length === 1) {
    initials = initials + 'X'; // Add X for single letter companies
  }
  
  return initials.substring(0, 3) || 'UNK';
};

const generateCaseId = (data: TransformedERCData): string => {
  const ein = data.companyInfo.ein || '';
  const initials = getCompanyInitials(data.companyInfo.legalName);
  // Use sequence number 001 as we don't track multiple submissions
  return `${initials}_${ein}_001`;
};

const formatBoolean = (value: boolean | undefined, format: 'yes/no' | 'Y/N' = 'yes/no'): string => {
  if (format === 'yes/no') {
    return value ? 'yes' : 'no';
  }
  return value ? 'Y' : 'N';
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};

// Format phone number to (XXX) XXX-XXXX format
const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if we have exactly 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
};

// Generate operational triggers in the complex format
const generateOperationalTriggers = (data: TransformedERCData): string => {
  const triggers: string[] = [];
  const quarters: string[] = [];
  
  // Determine affected quarters
  if (data.qualifyingQuestions) {
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
      const q2020 = data.qualifyingQuestions[2020][q as 'Q1' | 'Q2' | 'Q3' | 'Q4'];
      if (q2020.supplyDisruptions || q2020.vendorDisruptions || q2020.governmentShutdown) {
        quarters.push(`2020${q}`);
      }
    });
    
    ['Q1', 'Q2', 'Q3'].forEach(q => {
      const q2021 = data.qualifyingQuestions[2021][q as 'Q1' | 'Q2' | 'Q3'];
      if (q2021.supplyDisruptions || q2021.vendorDisruptions || q2021.governmentShutdown) {
        quarters.push(`2021${q}`);
      }
    });
  }
  
  const quarterList = quarters.join(',');
  
  // Build trigger descriptions
  if (data.shutdownStandards?.supplyChainInterruptions) {
    triggers.push(`supplies_delayed|${quarterList}|Supply chain interruptions impacted operations`);
  }
  if (data.shutdownStandards?.inabilityWorkVendors) {
    triggers.push(`vendor_disruptions|${quarterList}|Critical vendors unable to deliver`);
  }
  if (data.shutdownStandards?.limitedCapacity) {
    triggers.push(`limited_capacity|${quarterList}|Operated under capacity restrictions`);
  }
  if (data.shutdownStandards?.inabilityAccessEquipment) {
    triggers.push(`equipment_access|${quarterList}|Unable to access equipment`);
  }
  
  return triggers.join(';') || '';
};

// Generate claimed quarters list
const generateClaimedQuarters = (data: TransformedERCData): string => {
  const quarters: string[] = [];
  
  // Check 2020 quarters (Q2-Q4 only for ERC)
  ['Q2', 'Q3', 'Q4'].forEach(q => {
    const qData = data.qualifyingQuestions?.[2020]?.[q as 'Q2' | 'Q3' | 'Q4'];
    if (qData && (qData.governmentShutdown || qData.revenueReduction20Percent || qData.supplyDisruptions)) {
      quarters.push(`2020${q}`);
    }
  });
  
  // Check 2021 quarters (Q1-Q3 only for ERC)
  ['Q1', 'Q2', 'Q3'].forEach(q => {
    const qData = data.qualifyingQuestions?.[2021]?.[q as 'Q1' | 'Q2' | 'Q3'];
    if (qData && (qData.governmentShutdown || qData.revenueReduction20Percent || qData.supplyDisruptions)) {
      quarters.push(`2021${q}`);
    }
  });
  
  return quarters.join(',');
};

// Generate claim amounts in format: 2021Q1:50212.77,2021Q2:79131.99
const generateClaimAmounts = (data: TransformedERCData): string => {
  const amounts: string[] = [];
  
  // Check 2020 quarters
  ['Q2', 'Q3', 'Q4'].forEach(q => {
    const wages = data.form941Data?.[2020]?.[q as 'Q2' | 'Q3' | 'Q4']?.retentionCreditWages;
    if (wages && wages > 0) {
      amounts.push(`2020${q}:${wages.toFixed(2)}`);
    }
  });
  
  // Check 2021 quarters
  ['Q1', 'Q2', 'Q3'].forEach(q => {
    const wages = data.form941Data?.[2021]?.[q as 'Q1' | 'Q2' | 'Q3']?.retentionCreditWages;
    if (wages && wages > 0) {
      amounts.push(`2021${q}:${wages.toFixed(2)}`);
    }
  });
  
  return amounts.join(',');
};

// Generate received checks format
const generateReceivedChecks = (data: TransformedERCData): string => {
  const checks: string[] = [];
  
  // For each claimed quarter, set to "No" by default
  const claimedQuarters = generateClaimedQuarters(data).split(',');
  claimedQuarters.forEach(q => {
    if (q) {
      checks.push(`${q}:No`);
    }
  });
  
  return checks.join(',');
};

// Generate revenue periods
const generateRevenuePeriods = (data: TransformedERCData): string => {
  const periods: string[] = [];
  
  // Check for revenue reduction in each quarter
  if (data.revenueReductionQuestions?.reduction50_2020) {
    periods.push('2020Q2', '2020Q3', '2020Q4');
  }
  if (data.revenueReductionQuestions?.reduction20_2021) {
    periods.push('2021Q1', '2021Q2', '2021Q3');
  }
  
  return periods.join(',');
};

// Generate hardship description
const generateHardshipDescription = (data: TransformedERCData): string => {
  const company = data.companyInfo?.legalName || 'The company';
  const ein = data.companyInfo?.ein || '';
  
  let description = `${company} experienced significant hardships during the COVID-19 pandemic. `;
  
  if (data.shutdownStandards?.fullShutdowns) {
    description += 'The business faced full shutdowns due to government orders. ';
  }
  if (data.shutdownStandards?.partialShutdowns) {
    description += 'Operations were partially suspended during mandatory restrictions. ';
  }
  if (data.shutdownStandards?.supplyChainInterruptions) {
    description += 'Supply chain disruptions severely impacted our ability to operate. ';
  }
  if (data.shutdownStandards?.limitedCapacity) {
    description += 'We operated under limited capacity restrictions. ';
  }
  
  // Add revenue impact
  if (data.revenueReductionQuestions?.reduction50_2020) {
    description += 'Revenue declined by more than 50% in 2020 compared to 2019. ';
  }
  if (data.revenueReductionQuestions?.reduction20_2021) {
    description += 'Revenue declined by more than 20% in 2021 compared to 2019. ';
  }
  
  // Add employee impact
  const emp2019 = data.companyInfo?.fullTimeW2Count2019 || 0;
  const emp2020 = data.companyInfo?.fullTimeW2Count2020 || 0;
  const emp2021 = data.companyInfo?.fullTimeW2Count2021 || 0;
  
  if (emp2020 < emp2019) {
    description += `Employee count dropped from ${emp2019} in 2019 to ${emp2020} in 2020. `;
  }
  
  // Add PPP information
  if (data.pppInformation?.ppp1ForgivenessAmount && data.pppInformation.ppp1ForgivenessAmount > 0) {
    description += `We received PPP assistance to maintain payroll. `;
  }
  
  description += 'These factors qualify us for the Employee Retention Credit.';
  
  return description;
};

// Bulk Upload field definitions (all 52 fields)
export const BULK_UPLOAD_FIELDS: BulkUploadField[] = [
  {
    fieldNumber: 1,
    fieldName: 'case_id',
    description: 'Unique case identifier',
    dataType: 'TEXT',
    required: true,
    generator: generateCaseId
  },
  {
    fieldNumber: 2,
    fieldName: 'contact_first_name',
    description: 'Contact first name',
    dataType: 'TEXT',
    required: true,
    defaultValue: '',
    generator: (data) => data.companyInfo?.contactFirstName || ''
  },
  {
    fieldNumber: 3,
    fieldName: 'contact_last_name',
    description: 'Contact last name',
    dataType: 'TEXT',
    required: true,
    defaultValue: '',
    generator: (data) => data.companyInfo?.contactLastName || ''
  },
  {
    fieldNumber: 4,
    fieldName: 'job_title',
    description: 'Contact job title',
    dataType: 'TEXT',
    required: true,
    defaultValue: '',
    generator: (data) => data.companyInfo?.contactJobTitle || ''
  },
  {
    fieldNumber: 5,
    fieldName: 'main_phone',
    description: 'Main phone number',
    dataType: 'TEXT',
    required: true,
    defaultValue: '',
    generator: (data) => formatPhoneNumber(data.companyInfo?.mainPhone) || ''
  },
  {
    fieldNumber: 6,
    fieldName: 'email',
    description: 'Email address',
    dataType: 'TEXT',
    required: true,
    defaultValue: '',
    generator: (data) => data.companyInfo?.email || ''
  },
  {
    fieldNumber: 7,
    fieldName: 'business_legal_name',
    description: 'Legal business name',
    dataType: 'TEXT',
    required: true,
    generator: (data) => data.companyInfo?.legalName || ''
  },
  {
    fieldNumber: 8,
    fieldName: 'industry',
    description: 'Industry type',
    dataType: 'TEXT',
    required: true,
    defaultValue: '',
    generator: (data) => data.companyInfo?.industry || ''
  },
  {
    fieldNumber: 9,
    fieldName: 'website',
    description: 'Company website',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: (data) => data.companyInfo?.website || ''
  },
  {
    fieldNumber: 10,
    fieldName: 'business_address',
    description: 'Business street address',
    dataType: 'TEXT',
    required: true,
    generator: (data) => data.companyInfo?.address?.line1 || ''
  },
  {
    fieldNumber: 11,
    fieldName: 'suite_unit',
    description: 'Suite or unit number',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: (data) => data.companyInfo?.address?.line2 || ''
  },
  {
    fieldNumber: 12,
    fieldName: 'business_city',
    description: 'Business city',
    dataType: 'TEXT',
    required: true,
    generator: (data) => data.companyInfo?.address?.city || ''
  },
  {
    fieldNumber: 13,
    fieldName: 'business_state',
    description: 'Business state',
    dataType: 'TEXT',
    required: true,
    generator: (data) => data.companyInfo?.address?.state || ''
  },
  {
    fieldNumber: 14,
    fieldName: 'business_zip',
    description: 'Business ZIP code',
    dataType: 'TEXT',
    required: true,
    generator: (data) => data.companyInfo?.address?.zip || ''
  },
  {
    fieldNumber: 15,
    fieldName: 'pays_health_insurance',
    description: 'Pays health insurance',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => {
      // Check if there are health plan expenses
      const hasHealthExpenses = ['Q2', 'Q3', 'Q4'].some(q => 
        data.form941Data?.[2020]?.[q as 'Q2' | 'Q3' | 'Q4']?.qualifiedHealthPlanExpenses > 0
      ) || ['Q1', 'Q2', 'Q3'].some(q => 
        data.form941Data?.[2021]?.[q as 'Q1' | 'Q2' | 'Q3']?.qualifiedHealthPlanExpenses > 0
      );
      return formatBoolean(hasHealthExpenses);
    }
  },
  {
    fieldNumber: 16,
    fieldName: 'uses_peo',
    description: 'Uses PEO',
    dataType: 'BOOLEAN',
    required: true,
    defaultValue: 'no',
    generator: () => 'no'
  },
  {
    fieldNumber: 17,
    fieldName: 'peo_provider',
    description: 'PEO provider name',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 18,
    fieldName: 'start_date',
    description: 'Business start date',
    dataType: 'TEXT',
    required: true,
    defaultValue: 'before',
    generator: () => 'before' // Assuming business started before 2019
  },
  {
    fieldNumber: 19,
    fieldName: 'current_employee_count',
    description: 'Current employee count',
    dataType: 'NUMBER',
    required: true,
    generator: (data) => String(data.companyInfo?.fullTimeW2Count2021 || 0)
  },
  {
    fieldNumber: 20,
    fieldName: 'employee_count_2019',
    description: '2019 employee count category',
    dataType: 'TEXT',
    required: true,
    generator: (data) => {
      const count = data.companyInfo?.fullTimeW2Count2019 || 0;
      if (count < 100) return 'less-100';
      if (count <= 500) return '100-500';
      return 'more-500';
    }
  },
  {
    fieldNumber: 21,
    fieldName: 'filed_other_entities',
    description: 'Filed for other entities',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => formatBoolean(data.revenueReductionQuestions?.ownOtherBusiness)
  },
  {
    fieldNumber: 22,
    fieldName: 'other_entities',
    description: 'Other entities list',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 23,
    fieldName: 'is_government_entity',
    description: 'Is government entity',
    dataType: 'BOOLEAN',
    required: true,
    defaultValue: 'no',
    generator: () => 'no'
  },
  {
    fieldNumber: 24,
    fieldName: 'entity_type',
    description: 'Entity type',
    dataType: 'TEXT',
    required: true,
    defaultValue: 'corporation',
    generator: () => 'corporation'
  },
  {
    fieldNumber: 25,
    fieldName: 'ein',
    description: 'Employer Identification Number',
    dataType: 'TEXT',
    required: true,
    generator: (data) => data.companyInfo?.ein || ''
  },
  {
    fieldNumber: 26,
    fieldName: 'primary_ssn',
    description: 'Primary owner SSN',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 27,
    fieldName: 'number_of_owners',
    description: 'Number of owners',
    dataType: 'NUMBER',
    required: true,
    defaultValue: '1',
    generator: () => '1'
  },
  {
    fieldNumber: 28,
    fieldName: 'owner_percentages',
    description: 'Owner names and percentages',
    dataType: 'TEXT',
    required: true,
    generator: (data) => {
      const name = data.ownershipStructure?.ownerName || 'Owner';
      // Get percentage - should be a number now (e.g., 50 for 50%)
      let pct = 100; // Default to 100% if not specified
      
      const ownerPct = data.ownershipStructure?.ownerPercentage;
      if (ownerPct !== undefined && ownerPct !== null) {
        if (typeof ownerPct === 'number') {
          pct = ownerPct;
        } else if (typeof ownerPct === 'boolean') {
          // Legacy support: true = 100%, false = 0%
          pct = ownerPct ? 100 : 0;
        } else {
          // Try to parse as string
          try {
            const str = String(ownerPct).replace('%', '');
            const parsed = parseFloat(str);
            if (!isNaN(parsed)) {
              pct = parsed;
            }
          } catch (e) {
            // Keep default of 100
          }
        }
      }
      
      return `${name}||${pct}`;
    }
  },
  {
    fieldNumber: 29,
    fieldName: 'family_members_count',
    description: 'Family members count',
    dataType: 'NUMBER',
    required: true,
    defaultValue: '0',
    generator: () => '0'
  },
  {
    fieldNumber: 30,
    fieldName: 'family_members',
    description: 'Family members list',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 31,
    fieldName: 'revenue_drop_qualified',
    description: 'Revenue drop qualified',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => {
      const qualified = data.revenueReductionQuestions?.reduction50_2020 || 
                       data.revenueReductionQuestions?.reduction20_2021;
      return formatBoolean(qualified);
    }
  },
  {
    fieldNumber: 32,
    fieldName: 'revenue_periods',
    description: 'Revenue reduction periods',
    dataType: 'TEXT',
    required: false,
    generator: generateRevenuePeriods
  },
  {
    fieldNumber: 33,
    fieldName: 'operational_triggers',
    description: 'Operational triggers',
    dataType: 'COMPLEX',
    required: false,
    generator: generateOperationalTriggers
  },
  {
    fieldNumber: 34,
    fieldName: 'claimed_quarters',
    description: 'Claimed quarters',
    dataType: 'TEXT',
    required: true,
    generator: generateClaimedQuarters
  },
  {
    fieldNumber: 35,
    fieldName: 'claim_amounts',
    description: 'Claim amounts by quarter',
    dataType: 'TEXT',
    required: false,
    generator: generateClaimAmounts
  },
  {
    fieldNumber: 36,
    fieldName: 'received_checks',
    description: 'Received checks status',
    dataType: 'TEXT',
    required: false,
    generator: generateReceivedChecks
  },
  {
    fieldNumber: 37,
    fieldName: 'selected_credits',
    description: 'Selected credits',
    dataType: 'TEXT',
    required: false,
    generator: (data) => {
      const credits: string[] = [];
      if (data.pppInformation?.ppp1ForgivenessAmount > 0) {
        credits.push(`PPP||${data.pppInformation.ppp1ForgivenessAmount}`);
      }
      if (data.pppInformation?.ppp2ForgivenessAmount > 0) {
        credits.push(`PPP||${data.pppInformation.ppp2ForgivenessAmount}`);
      }
      return credits.join(';');
    }
  },
  {
    fieldNumber: 38,
    fieldName: 'ppp_received',
    description: 'PPP received',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => {
      const received = (data.pppInformation?.ppp1ForgivenessAmount > 0) || 
                      (data.pppInformation?.ppp2ForgivenessAmount > 0);
      return formatBoolean(received);
    }
  },
  {
    fieldNumber: 39,
    fieldName: 'ppp_forgiven',
    description: 'PPP forgiven',
    dataType: 'BOOLEAN',
    required: true,
    generator: (data) => {
      const forgiven = (data.pppInformation?.ppp1ForgivenessAmount > 0) || 
                      (data.pppInformation?.ppp2ForgivenessAmount > 0);
      return formatBoolean(forgiven);
    }
  },
  {
    fieldNumber: 40,
    fieldName: 'ppp1_amount',
    description: 'PPP1 amount',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => String(data.pppInformation?.ppp1ForgivenessAmount || 0)
  },
  {
    fieldNumber: 41,
    fieldName: 'ppp2_amount',
    description: 'PPP2 amount',
    dataType: 'NUMBER',
    required: false,
    generator: (data) => String(data.pppInformation?.ppp2ForgivenessAmount || 0)
  },
  {
    fieldNumber: 42,
    fieldName: 'hardship_description',
    description: 'Hardship description',
    dataType: 'TEXT',
    required: true,
    generator: generateHardshipDescription
  },
  {
    fieldNumber: 43,
    fieldName: 'original_preparer',
    description: 'Original preparer',
    dataType: 'TEXT',
    required: false,
    defaultValue: 'ERC Portal',
    generator: () => 'ERC Portal'
  },
  {
    fieldNumber: 44,
    fieldName: 'form941x_files',
    description: 'Form 941-X files',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 45,
    fieldName: 'substantiation_files',
    description: 'Substantiation files',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 46,
    fieldName: 'health_insurance_files',
    description: 'Health insurance files',
    dataType: 'TEXT',
    required: false,
    defaultValue: '',
    generator: () => ''
  },
  {
    fieldNumber: 47,
    fieldName: 'skip_document_generation',
    description: 'Skip document generation',
    dataType: 'BOOLEAN',
    required: true,
    defaultValue: 'no',
    generator: () => 'no'
  },
  {
    fieldNumber: 48,
    fieldName: 'skip_esignature',
    description: 'Skip e-signature',
    dataType: 'BOOLEAN',
    required: true,
    defaultValue: 'no',
    generator: () => 'no'
  },
  {
    fieldNumber: 49,
    fieldName: 'skip_gdrive_sync',
    description: 'Skip Google Drive sync',
    dataType: 'BOOLEAN',
    required: true,
    defaultValue: 'no',
    generator: () => 'no'
  },
  {
    fieldNumber: 50,
    fieldName: 'process_priority',
    description: 'Process priority',
    dataType: 'TEXT',
    required: true,
    defaultValue: 'normal',
    generator: () => 'normal'
  },
  {
    fieldNumber: 51,
    fieldName: 'upload_date_time',
    description: 'Upload date and time',
    dataType: 'DATE',
    required: true,
    generator: () => formatDate(new Date())
  },
  {
    fieldNumber: 52,
    fieldName: 'filed_date',
    description: 'Filed date',
    dataType: 'DATE',
    required: false,
    defaultValue: '',
    generator: () => ''
  }
];

// Export helper functions
export function getAllBulkUploadFields(): BulkUploadField[] {
  return BULK_UPLOAD_FIELDS;
}

export function getBulkUploadFieldByNumber(fieldNumber: number): BulkUploadField | undefined {
  return BULK_UPLOAD_FIELDS.find(f => f.fieldNumber === fieldNumber);
}