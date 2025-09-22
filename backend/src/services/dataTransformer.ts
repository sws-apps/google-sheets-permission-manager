import { ExtractedData } from './excelTemplateParser';

// Output data structures
export interface QuarterlyData<T> {
  Q1: T;
  Q2: T;
  Q3: T;
  Q4: T;
}

export interface QualifyingQuestionsData {
  governmentShutdown: boolean;
  inabilityToMeet: boolean;
  supplyDisruptions: boolean;
  vendorDisruptions: boolean;
  revenueReduction10Percent: boolean;
  revenueReduction20Percent: boolean;
  recoveryStartupBusiness: boolean;
  severelyDistressedEmployer: boolean;
}

export interface Form941QuarterData {
  employeeCount: number;
  totalWages: number;
  federalTaxWithheld: number;
  qualifiedSickWages: number;
  qualifiedFamilyLeaveWages: number;
  retentionCreditWages: number;
  qualifiedHealthPlanExpenses: number;
  form5884Credit: number;
}

export interface Form940YearData {
  totalPayments: number;
  exemptPayments: number;
  exemptPaymentsBreakdown: {
    retirement: number;
    groupLifeInsurance: number;
    dependentCare: number;
    other: number;
  };
  excessPayments: number;
  subtotal: number;
  taxableFutaWages: number;
  futaTax: number;
}

export interface StatePayrollQuarterData {
  suiTaxableWages: number;
  suiTaxRate: number; // Stored as decimal (e.g., 0.034 for 3.4%)
  suiTaxAmount: number;
  sdiTaxableWages: number;
  sdiTaxAmount: number;
}

export interface ShutdownStandardsData {
  fullShutdowns: boolean;
  partialShutdowns: boolean;
  interruptedOperations: boolean;
  supplyChainInterruptions: boolean;
  inabilityAccessEquipment: boolean;
  limitedCapacity: boolean;
  inabilityWorkVendors: boolean;
  reductionServices: boolean;
  cutDownHours: boolean;
  shiftingHoursSanitation: boolean;
  challengesFindingEmployees: boolean;
  otherComments: string;
}

export interface PPPInformationData {
  ppp1ForgivenessAmount: number;
  ppp2ForgivenessAmount: number;
  // Note: PPP loan date and NAICS code fields exist in template but have no values in this sample
}

export interface OwnershipData {
  ownerName: string;
  ownerPercentage: number | boolean; // Can be percentage or boolean (100%)
}

export interface TransformedERCData {
  companyInfo: {
    // Basic Info
    ein: string;
    legalName: string;
    tradeName: string;
    address: {
      line1: string;
      line2?: string; // Suite/unit
      city: string;
      state: string;
      zip: string;
    };
    // Contact Information (for bulk upload)
    contactFirstName?: string;
    contactLastName?: string;
    contactJobTitle?: string;
    mainPhone?: string;
    email?: string;
    // Business Details
    industry?: string;
    website?: string;
    // Employee counts
    filerRemarks: string;
    fullTimeW2Count2019: number;
    fullTimeW2Count2020: number;
    fullTimeW2Count2021: number;
    fullTimeEmployees: number;
  };
  
  qualifyingQuestions: {
    2020: QuarterlyData<QualifyingQuestionsData>;
    2021: {
      Q1: QualifyingQuestionsData;
      Q2: QualifyingQuestionsData;
      Q3: QualifyingQuestionsData;
      Q4?: QualifyingQuestionsData; // Q4 2021 might not be included
    };
  };
  
  revenueReductionQuestions: {
    reduction50_2020: boolean;
    reduction20_2021: boolean;
    ownOtherBusiness: boolean;
  };
  
  shutdownStandards: ShutdownStandardsData;
  
  grossReceipts: {
    2019: QuarterlyData<number>;
    2020: QuarterlyData<number>;
    2021: QuarterlyData<number>;
  };
  
  pppInformation: PPPInformationData;
  
  ownershipStructure: OwnershipData;
  
  form941Data: {
    2020: QuarterlyData<Form941QuarterData>;
    2021: QuarterlyData<Form941QuarterData>;
  };
  
  quarterlyEmployeeCounts: {
    2020: QuarterlyData<number>;
    2021: QuarterlyData<number>;
  };
  
  quarterlyTaxableWages: {
    2020: QuarterlyData<number>;
    2021: QuarterlyData<number>;
  };
  
  form940Data: {
    2020: Form940YearData;
    2021: Form940YearData;
  };
  
  statePayrollTaxes: {
    2020: QuarterlyData<StatePayrollQuarterData>;
    2021: QuarterlyData<StatePayrollQuarterData>;
  };
  
  metadata: {
    extractionDate: Date;
    templateVersion: string;
    validationStatus: 'valid' | 'partial' | 'invalid';
    missingFields?: string[];
  };
}

export class DataTransformer {
  /**
   * Transform raw extracted data into organized structure
   */
  static transform(extractedData: ExtractedData): TransformedERCData {
    const transformed: TransformedERCData = {
      companyInfo: this.transformCompanyInfo(extractedData),
      qualifyingQuestions: this.transformQualifyingQuestions(extractedData),
      revenueReductionQuestions: this.transformRevenueReductionQuestions(extractedData),
      shutdownStandards: this.transformShutdownStandards(extractedData),
      grossReceipts: this.transformGrossReceipts(extractedData),
      pppInformation: this.transformPPPInformation(extractedData),
      ownershipStructure: this.transformOwnershipStructure(extractedData),
      form941Data: this.transformForm941Data(extractedData),
      quarterlyEmployeeCounts: this.transformQuarterlyEmployeeCounts(extractedData),
      quarterlyTaxableWages: this.transformQuarterlyTaxableWages(extractedData),
      form940Data: this.transformForm940Data(extractedData),
      statePayrollTaxes: this.transformStatePayrollTaxes(extractedData),
      metadata: {
        extractionDate: new Date(),
        templateVersion: '1.0',
        validationStatus: 'valid'
      }
    };

    // Validate completeness
    const missingFields = this.checkMissingFields(transformed);
    if (missingFields.length > 0) {
      transformed.metadata.validationStatus = 'partial';
      transformed.metadata.missingFields = missingFields;
    }

    return transformed;
  }

  /**
   * Create an empty TransformedERCData structure for metadata-only rows
   * Used when there's no Google Sheets URL to extract data from
   */
  static createEmptyData(): TransformedERCData {
    const emptyQuarterData = (): QualifyingQuestionsData => ({
      governmentShutdown: false,
      inabilityToMeet: false,
      supplyDisruptions: false,
      vendorDisruptions: false,
      revenueReduction10Percent: false,
      revenueReduction20Percent: false,
      recoveryStartupBusiness: false,
      severelyDistressedEmployer: false
    });

    const emptyForm941Quarter = (): Form941QuarterData => ({
      employeeCount: 0,
      totalWages: 0,
      federalTaxWithheld: 0,
      qualifiedSickWages: 0,
      qualifiedFamilyLeaveWages: 0,
      retentionCreditWages: 0,
      qualifiedHealthPlanExpenses: 0,
      form5884Credit: 0
    });

    const emptyStatePayrollQuarter = (): StatePayrollQuarterData => ({
      suiTaxableWages: 0,
      suiTaxRate: 0,
      suiTaxAmount: 0,
      sdiTaxableWages: 0,
      sdiTaxAmount: 0
    });

    const emptyForm940Year = (): Form940YearData => ({
      totalPayments: 0,
      exemptPayments: 0,
      exemptPaymentsBreakdown: {
        retirement: 0,
        groupLifeInsurance: 0,
        dependentCare: 0,
        other: 0
      },
      excessPayments: 0,
      subtotal: 0,
      taxableFutaWages: 0,
      futaTax: 0
    });

    return {
      companyInfo: {
        ein: '',
        legalName: '',
        tradeName: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: ''
        },
        contactFirstName: '',
        contactLastName: '',
        contactJobTitle: '',
        mainPhone: '',
        email: '',
        industry: '',
        website: '',
        filerRemarks: '',
        fullTimeW2Count2019: 0,
        fullTimeW2Count2020: 0,
        fullTimeW2Count2021: 0,
        fullTimeEmployees: 0
      },
      qualifyingQuestions: {
        2020: {
          Q1: emptyQuarterData(),
          Q2: emptyQuarterData(),
          Q3: emptyQuarterData(),
          Q4: emptyQuarterData()
        },
        2021: {
          Q1: emptyQuarterData(),
          Q2: emptyQuarterData(),
          Q3: emptyQuarterData()
        }
      },
      revenueReductionQuestions: {
        reduction50_2020: false,
        reduction20_2021: false,
        ownOtherBusiness: false
      },
      shutdownStandards: {
        fullShutdowns: false,
        partialShutdowns: false,
        interruptedOperations: false,
        supplyChainInterruptions: false,
        inabilityAccessEquipment: false,
        limitedCapacity: false,
        inabilityWorkVendors: false,
        reductionServices: false,
        cutDownHours: false,
        shiftingHoursSanitation: false,
        challengesFindingEmployees: false,
        otherComments: ''
      },
      grossReceipts: {
        2019: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        2020: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        2021: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
      },
      pppInformation: {
        ppp1ForgivenessAmount: 0,
        ppp2ForgivenessAmount: 0
      },
      ownershipStructure: {
        ownerName: '',
        ownerPercentage: 0
      },
      form941Data: {
        2020: {
          Q1: emptyForm941Quarter(),
          Q2: emptyForm941Quarter(),
          Q3: emptyForm941Quarter(),
          Q4: emptyForm941Quarter()
        },
        2021: {
          Q1: emptyForm941Quarter(),
          Q2: emptyForm941Quarter(),
          Q3: emptyForm941Quarter(),
          Q4: emptyForm941Quarter()
        }
      },
      quarterlyEmployeeCounts: {
        2020: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        2021: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
      },
      quarterlyTaxableWages: {
        2020: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        2021: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
      },
      form940Data: {
        2020: emptyForm940Year(),
        2021: emptyForm940Year()
      },
      statePayrollTaxes: {
        2020: {
          Q1: emptyStatePayrollQuarter(),
          Q2: emptyStatePayrollQuarter(),
          Q3: emptyStatePayrollQuarter(),
          Q4: emptyStatePayrollQuarter()
        },
        2021: {
          Q1: emptyStatePayrollQuarter(),
          Q2: emptyStatePayrollQuarter(),
          Q3: emptyStatePayrollQuarter(),
          Q4: emptyStatePayrollQuarter()
        }
      },
      metadata: {
        extractionDate: new Date(),
        templateVersion: '1.0',
        validationStatus: 'partial',
        missingFields: ['No Google Sheets data extracted']
      }
    };
  }

  /**
   * Transform company information
   */
  private static transformCompanyInfo(data: ExtractedData): TransformedERCData['companyInfo'] {
    return {
      ein: data.companyEIN || '',
      legalName: data.companyName || '',
      tradeName: data.tradeName || '',
      address: {
        line1: data.addressLine1 || '',
        city: data.addressCity || '',
        state: data.addressState || '',
        zip: data.addressZip || ''
      },
      filerRemarks: data.filerRemarks || '',
      fullTimeW2Count2019: data.fullTimeW2Count2019 || 0,
      fullTimeW2Count2020: data.fullTimeW2Count2020 || 0,
      fullTimeW2Count2021: data.fullTimeW2Count2021 || 0,
      fullTimeEmployees: Math.round(((data.fullTimeW2Count2019 || 0) + (data.fullTimeW2Count2020 || 0) + (data.fullTimeW2Count2021 || 0)) / 3)
    };
  }

  /**
   * Transform qualifying questions data
   */
  private static transformQualifyingQuestions(data: ExtractedData): TransformedERCData['qualifyingQuestions'] {
    const createQuarterData = (year: string, quarter: string): QualifyingQuestionsData => ({
      governmentShutdown: data[`shutdown_${quarter}_${year}`] || false,
      inabilityToMeet: data[`meetings_${quarter}_${year}`] || false,
      supplyDisruptions: data[`supply_${quarter}_${year}`] || false,
      vendorDisruptions: data[`vendor_${quarter}_${year}`] || false,
      revenueReduction10Percent: data[`reduction10_${quarter}_${year}`] || false,
      revenueReduction20Percent: data[`reduction20_${quarter}_${year}`] || false,
      recoveryStartupBusiness: data[`recovery_${quarter}_${year}`] || false,
      severelyDistressedEmployer: data[`distressed_${quarter}_${year}`] || false
    });

    return {
      2020: {
        Q1: createQuarterData('2020', 'q1'),
        Q2: createQuarterData('2020', 'q2'),
        Q3: createQuarterData('2020', 'q3'),
        Q4: createQuarterData('2020', 'q4')
      },
      2021: {
        Q1: createQuarterData('2021', 'q1'),
        Q2: createQuarterData('2021', 'q2'),
        Q3: createQuarterData('2021', 'q3')
        // Q4 2021 might not be included in template
      }
    };
  }

  /**
   * Transform revenue reduction questions
   */
  private static transformRevenueReductionQuestions(data: ExtractedData): TransformedERCData['revenueReductionQuestions'] {
    return {
      reduction50_2020: data.reduction50_2020 || false,
      reduction20_2021: data.reduction20_2021 || false,
      ownOtherBusiness: data.ownOtherBusiness || false
    };
  }

  /**
   * Transform shutdown standards data
   */
  private static transformShutdownStandards(data: ExtractedData): TransformedERCData['shutdownStandards'] {
    return {
      fullShutdowns: data.fullShutdowns || false,
      partialShutdowns: data.partialShutdowns || false,
      interruptedOperations: data.interruptedOperations || false,
      supplyChainInterruptions: data.supplyChainInterruptions || false,
      inabilityAccessEquipment: data.inabilityAccessEquipment || false,
      limitedCapacity: data.limitedCapacity || false,
      inabilityWorkVendors: data.inabilityWorkVendors || false,
      reductionServices: data.reductionServices || false,
      cutDownHours: data.cutDownHours || false,
      shiftingHoursSanitation: data.shiftingHoursSanitation || false,
      challengesFindingEmployees: data.challengesFindingEmployees || false,
      otherComments: data.shutdownOtherComments || ''
    };
  }

  /**
   * Transform PPP information
   */
  private static transformPPPInformation(data: ExtractedData): TransformedERCData['pppInformation'] {
    return {
      ppp1ForgivenessAmount: data.ppp1ForgivenessAmount || 0,
      ppp2ForgivenessAmount: data.ppp2ForgivenessAmount || 0
    };
  }

  /**
   * Transform ownership structure
   */
  private static transformOwnershipStructure(data: ExtractedData): TransformedERCData['ownershipStructure'] {
    // Handle ownership percentage - convert boolean to number if needed
    let percentage = 100; // Default to 100%
    
    if (data.ownerPercentage !== undefined && data.ownerPercentage !== null) {
      if (typeof data.ownerPercentage === 'number') {
        percentage = data.ownerPercentage;
      } else if (typeof data.ownerPercentage === 'boolean') {
        // Legacy: true = 100%, false = 0%
        percentage = data.ownerPercentage ? 100 : 0;
      } else {
        // Try to parse as string
        try {
          const str = String(data.ownerPercentage).replace('%', '');
          const parsed = parseFloat(str);
          if (!isNaN(parsed)) {
            percentage = parsed;
          }
        } catch (e) {
          // Keep default of 100
        }
      }
    }
    
    return {
      ownerName: data.ownerName || '',
      ownerPercentage: percentage
    };
  }

  /**
   * Transform gross receipts data
   */
  private static transformGrossReceipts(data: ExtractedData): TransformedERCData['grossReceipts'] {
    return {
      2019: {
        Q1: data.gross_receipts_2019_q1 || 0,
        Q2: data.gross_receipts_2019_q2 || 0,
        Q3: data.gross_receipts_2019_q3 || 0,
        Q4: data.gross_receipts_2019_q4 || 0
      },
      2020: {
        Q1: data.gross_receipts_2020_q1 || 0,
        Q2: data.gross_receipts_2020_q2 || 0,
        Q3: data.gross_receipts_2020_q3 || 0,
        Q4: data.gross_receipts_2020_q4 || 0
      },
      2021: {
        Q1: data.gross_receipts_2021_q1 || 0,
        Q2: data.gross_receipts_2021_q2 || 0,
        Q3: data.gross_receipts_2021_q3 || 0,
        Q4: data.gross_receipts_2021_q4 || 0
      }
    };
  }

  /**
   * Transform Form 941 data
   */
  private static transformForm941Data(data: ExtractedData): TransformedERCData['form941Data'] {
    const createQuarterData = (year: string, quarter: string): Form941QuarterData => ({
      employeeCount: data[`form941_${year}_${quarter}_employees`] || 0,
      totalWages: data[`form941_${year}_${quarter}_wages`] || 0,
      federalTaxWithheld: data[`form941_${year}_${quarter}_fedTax`] || 0,
      qualifiedSickWages: data[`form941_${year}_${quarter}_sickWages`] || 0,
      qualifiedFamilyLeaveWages: data[`form941_${year}_${quarter}_familyLeave`] || 0,
      retentionCreditWages: data[`form941_${year}_${quarter}_retentionWages`] || 0,
      qualifiedHealthPlanExpenses: data[`form941_${year}_${quarter}_healthExpenses`] || 0,
      form5884Credit: data[`form941_${year}_${quarter}_form5884`] || 0
    });

    return {
      2020: {
        Q1: createQuarterData('2020', 'q1'),
        Q2: createQuarterData('2020', 'q2'),
        Q3: createQuarterData('2020', 'q3'),
        Q4: createQuarterData('2020', 'q4')
      },
      2021: {
        Q1: createQuarterData('2021', 'q1'),
        Q2: createQuarterData('2021', 'q2'),
        Q3: createQuarterData('2021', 'q3'),
        Q4: createQuarterData('2021', 'q4')
      }
    };
  }

  /**
   * Transform quarterly employee counts from 941 form
   */
  private static transformQuarterlyEmployeeCounts(data: ExtractedData): TransformedERCData['quarterlyEmployeeCounts'] {
    return {
      2020: {
        Q1: data.employeeCount_q1_2020 || 0,
        Q2: data.employeeCount_q2_2020 || 0,
        Q3: data.employeeCount_q3_2020 || 0,
        Q4: data.employeeCount_q4_2020 || 0
      },
      2021: {
        Q1: data.employeeCount_q1_2021 || 0,
        Q2: data.employeeCount_q2_2021 || 0,
        Q3: data.employeeCount_q3_2021 || 0,
        Q4: data.employeeCount_q4_2021 || 0
      }
    };
  }

  /**
   * Transform quarterly taxable wages from 941 form
   */
  private static transformQuarterlyTaxableWages(data: ExtractedData): TransformedERCData['quarterlyTaxableWages'] {
    return {
      2020: {
        Q1: data.taxableSocSecWages_q1_2020 || 0,
        Q2: data.taxableSocSecWages_q2_2020 || 0,
        Q3: data.taxableSocSecWages_q3_2020 || 0,
        Q4: data.taxableSocSecWages_q4_2020 || 0
      },
      2021: {
        Q1: data.taxableSocSecWages_q1_2021 || 0,
        Q2: data.taxableSocSecWages_q2_2021 || 0,
        Q3: data.taxableSocSecWages_q3_2021 || 0,
        Q4: 0 // Q4 2021 might not be available
      }
    };
  }

  /**
   * Transform Form 940 data
   */
  private static transformForm940Data(data: ExtractedData): TransformedERCData['form940Data'] {
    const createYearData = (year: string): Form940YearData => ({
      totalPayments: data[`form940_${year}_totalPayments`] || 0,
      exemptPayments: data[`form940_${year}_exemptPayments`] || 0,
      exemptPaymentsBreakdown: {
        retirement: data[`form940_${year}_retirement`] || 0,
        groupLifeInsurance: data[`form940_${year}_groupLife`] || 0,
        dependentCare: data[`form940_${year}_dependentCare`] || 0,
        other: data[`form940_${year}_other`] || 0
      },
      excessPayments: data[`form940_${year}_excessPayments`] || 0,
      subtotal: data[`form940_${year}_subtotal`] || 0,
      taxableFutaWages: data[`form940_${year}_taxableFutaWages`] || 0,
      futaTax: data[`form940_${year}_futaTax`] || 0
    });

    return {
      2020: createYearData('2020'),
      2021: createYearData('2021')
    };
  }

  /**
   * Transform state payroll taxes data
   */
  private static transformStatePayrollTaxes(data: ExtractedData): TransformedERCData['statePayrollTaxes'] {
    const createQuarterData = (year: string, quarter: string): StatePayrollQuarterData => ({
      suiTaxableWages: data[`state_${year}_${quarter}_suiWages`] || 0,
      suiTaxRate: data[`state_${year}_${quarter}_suiRate`] || 0,
      suiTaxAmount: data[`state_${year}_${quarter}_suiTax`] || 0,
      sdiTaxableWages: data[`state_${year}_${quarter}_sdiWages`] || 0,
      sdiTaxAmount: data[`state_${year}_${quarter}_sdiTax`] || 0
    });

    return {
      2020: {
        Q1: createQuarterData('2020', 'q1'),
        Q2: createQuarterData('2020', 'q2'),
        Q3: createQuarterData('2020', 'q3'),
        Q4: createQuarterData('2020', 'q4')
      },
      2021: {
        Q1: createQuarterData('2021', 'q1'),
        Q2: createQuarterData('2021', 'q2'),
        Q3: createQuarterData('2021', 'q3'),
        Q4: createQuarterData('2021', 'q4')
      }
    };
  }

  /**
   * Check for missing critical fields
   */
  private static checkMissingFields(data: TransformedERCData): string[] {
    const missing: string[] = [];

    // Check gross receipts (critical for ERC calculations)
    const years = [2019, 2020, 2021];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    for (const year of years) {
      for (const quarter of quarters) {
        const value = (data.grossReceipts as any)[year][quarter];
        if (value === 0) {
          missing.push(`Gross receipts ${year} ${quarter}`);
        }
      }
    }

    // Check Form 941 data for 2020 and 2021
    for (const year of [2020, 2021]) {
      for (const quarter of quarters) {
        const quarterData = (data.form941Data as any)[year][quarter];
        if (quarterData.employeeCount === 0 && quarterData.totalWages === 0) {
          missing.push(`Form 941 data ${year} ${quarter}`);
        }
      }
    }

    return missing;
  }

  /**
   * Calculate derived metrics from the transformed data
   */
  static calculateMetrics(data: TransformedERCData) {
    const metrics = {
      grossReceiptsDecline: this.calculateGrossReceiptsDecline(data.grossReceipts),
      totalRetentionCreditWages: this.calculateTotalRetentionCreditWages(data.form941Data),
      averageEmployeeCount: this.calculateAverageEmployeeCount(data.form941Data),
      eligibleQuarters: this.determineEligibleQuarters(data)
    };

    return metrics;
  }

  /**
   * Calculate gross receipts decline percentages
   */
  private static calculateGrossReceiptsDecline(grossReceipts: TransformedERCData['grossReceipts']) {
    const decline: any = { 2020: {}, 2021: {} };
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

    for (const quarter of quarters) {
      // 2020 vs 2019 comparison
      const receipts2019 = grossReceipts[2019][quarter];
      const receipts2020 = grossReceipts[2020][quarter];
      const receipts2021 = grossReceipts[2021][quarter];

      if (receipts2019 > 0) {
        decline[2020][quarter] = ((receipts2019 - receipts2020) / receipts2019) * 100;
        decline[2021][quarter] = ((receipts2019 - receipts2021) / receipts2019) * 100;
      }
    }

    return decline;
  }

  /**
   * Calculate total retention credit wages
   */
  private static calculateTotalRetentionCreditWages(form941Data: TransformedERCData['form941Data']) {
    let total = 0;
    const years = [2020, 2021] as const;
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

    for (const year of years) {
      for (const quarter of quarters) {
        total += form941Data[year][quarter].retentionCreditWages;
      }
    }

    return total;
  }

  /**
   * Calculate average employee count
   */
  private static calculateAverageEmployeeCount(form941Data: TransformedERCData['form941Data']) {
    let totalEmployees = 0;
    let quarterCount = 0;
    const years = [2020, 2021] as const;
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

    for (const year of years) {
      for (const quarter of quarters) {
        const count = form941Data[year][quarter].employeeCount;
        if (count > 0) {
          totalEmployees += count;
          quarterCount++;
        }
      }
    }

    return quarterCount > 0 ? Math.round(totalEmployees / quarterCount) : 0;
  }

  /**
   * Determine eligible quarters based on qualifying questions and gross receipts decline
   */
  private static determineEligibleQuarters(data: TransformedERCData) {
    const eligible: any = { 2020: {}, 2021: {} };
    const grossReceiptsDecline = this.calculateGrossReceiptsDecline(data.grossReceipts);
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

    for (const year of [2020, 2021] as const) {
      for (const quarter of quarters) {
        if (year === 2021 && quarter === 'Q4' && !data.qualifyingQuestions[2021].Q4) {
          continue; // Skip Q4 2021 if not in data
        }

        const questions = year === 2020 ? 
          data.qualifyingQuestions[2020][quarter] : 
          data.qualifyingQuestions[2021][quarter as 'Q1' | 'Q2' | 'Q3'];

        const decline = grossReceiptsDecline[year][quarter];

        eligible[year][quarter] = 
          questions.governmentShutdown ||
          questions.supplyDisruptions ||
          decline >= 20 ||
          (year === 2021 && decline >= 10) ||
          questions.recoveryStartupBusiness;
      }
    }

    return eligible;
  }
}