// Test script for ERC Portal Export functionality
import { TransformedERCData } from '../services/dataTransformer';
import { ERCPortalMapper } from '../services/ercPortalMapper';
import { getAllPortalFields } from '../config/ercPortalConfig';

// Sample transformed data for testing
const sampleData: TransformedERCData = {
  companyInfo: {
    ein: '52-1234567',
    legalName: 'Test Company LLC',
    tradeName: 'Test Company',
    address: {
      line1: '123 Main St',
      city: 'Elizabeth City',
      state: 'NC',
      zip: '27909'
    },
    filerRemarks: 'Test remarks',
    fullTimeW2Count2019: 25,
    fullTimeW2Count2020: 20,
    fullTimeW2Count2021: 22,
    fullTimeEmployees: 22
  },
  qualifyingQuestions: {
    2020: {
      Q1: {
        governmentShutdown: false,
        inabilityToMeet: false,
        supplyDisruptions: false,
        vendorDisruptions: false,
        revenueReduction10Percent: false,
        revenueReduction20Percent: false,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      },
      Q2: {
        governmentShutdown: true,
        inabilityToMeet: true,
        supplyDisruptions: true,
        vendorDisruptions: false,
        revenueReduction10Percent: false,
        revenueReduction20Percent: true,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      },
      Q3: {
        governmentShutdown: true,
        inabilityToMeet: true,
        supplyDisruptions: true,
        vendorDisruptions: true,
        revenueReduction10Percent: false,
        revenueReduction20Percent: true,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      },
      Q4: {
        governmentShutdown: true,
        inabilityToMeet: false,
        supplyDisruptions: true,
        vendorDisruptions: false,
        revenueReduction10Percent: false,
        revenueReduction20Percent: false,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      }
    },
    2021: {
      Q1: {
        governmentShutdown: false,
        inabilityToMeet: false,
        supplyDisruptions: true,
        vendorDisruptions: false,
        revenueReduction10Percent: true,
        revenueReduction20Percent: false,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      },
      Q2: {
        governmentShutdown: false,
        inabilityToMeet: false,
        supplyDisruptions: true,
        vendorDisruptions: false,
        revenueReduction10Percent: true,
        revenueReduction20Percent: false,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      },
      Q3: {
        governmentShutdown: false,
        inabilityToMeet: false,
        supplyDisruptions: false,
        vendorDisruptions: false,
        revenueReduction10Percent: false,
        revenueReduction20Percent: false,
        recoveryStartupBusiness: false,
        severelyDistressedEmployer: false
      }
    }
  },
  revenueReductionQuestions: {
    reduction50_2020: true,
    reduction20_2021: true,
    ownOtherBusiness: false
  },
  shutdownStandards: {
    fullShutdowns: true,
    partialShutdowns: true,
    interruptedOperations: true,
    supplyChainInterruptions: true,
    inabilityAccessEquipment: false,
    limitedCapacity: true,
    inabilityWorkVendors: false,
    reductionServices: true,
    cutDownHours: true,
    shiftingHoursSanitation: true,
    challengesFindingEmployees: true,
    otherComments: 'Additional COVID-19 impacts on business operations'
  },
  grossReceipts: {
    2019: {
      Q1: 500000,
      Q2: 550000,
      Q3: 525000,
      Q4: 575000
    },
    2020: {
      Q1: 450000,
      Q2: 250000,
      Q3: 275000,
      Q4: 400000
    },
    2021: {
      Q1: 425000,
      Q2: 475000,
      Q3: 500000,
      Q4: 525000
    }
  },
  pppInformation: {
    ppp1ForgivenessAmount: 79515,
    ppp2ForgivenessAmount: 130038
  },
  ownershipStructure: {
    ownerName: 'John Smith',
    ownerPercentage: 100
  },
  form941Data: {
    2020: {
      Q1: {
        employeeCount: 25,
        totalWages: 375000,
        federalTaxWithheld: 45000,
        qualifiedSickWages: 0,
        qualifiedFamilyLeaveWages: 0,
        retentionCreditWages: 0,
        qualifiedHealthPlanExpenses: 0,
        form5884Credit: 0
      },
      Q2: {
        employeeCount: 20,
        totalWages: 300000,
        federalTaxWithheld: 36000,
        qualifiedSickWages: 5000,
        qualifiedFamilyLeaveWages: 3000,
        retentionCreditWages: 50000,
        qualifiedHealthPlanExpenses: 10000,
        form5884Credit: 0
      },
      Q3: {
        employeeCount: 20,
        totalWages: 310000,
        federalTaxWithheld: 37200,
        qualifiedSickWages: 2000,
        qualifiedFamilyLeaveWages: 1000,
        retentionCreditWages: 100000,
        qualifiedHealthPlanExpenses: 10000,
        form5884Credit: 0
      },
      Q4: {
        employeeCount: 22,
        totalWages: 340000,
        federalTaxWithheld: 40800,
        qualifiedSickWages: 0,
        qualifiedFamilyLeaveWages: 0,
        retentionCreditWages: 70000,
        qualifiedHealthPlanExpenses: 10000,
        form5884Credit: 0
      }
    },
    2021: {
      Q1: {
        employeeCount: 22,
        totalWages: 350000,
        federalTaxWithheld: 42000,
        qualifiedSickWages: 0,
        qualifiedFamilyLeaveWages: 0,
        retentionCreditWages: 140000,
        qualifiedHealthPlanExpenses: 12000,
        form5884Credit: 0
      },
      Q2: {
        employeeCount: 22,
        totalWages: 355000,
        federalTaxWithheld: 42600,
        qualifiedSickWages: 0,
        qualifiedFamilyLeaveWages: 0,
        retentionCreditWages: 140000,
        qualifiedHealthPlanExpenses: 12000,
        form5884Credit: 0
      },
      Q3: {
        employeeCount: 22,
        totalWages: 360000,
        federalTaxWithheld: 43200,
        qualifiedSickWages: 0,
        qualifiedFamilyLeaveWages: 0,
        retentionCreditWages: 0,
        qualifiedHealthPlanExpenses: 12000,
        form5884Credit: 0
      },
      Q4: {
        employeeCount: 22,
        totalWages: 365000,
        federalTaxWithheld: 43800,
        qualifiedSickWages: 0,
        qualifiedFamilyLeaveWages: 0,
        retentionCreditWages: 0,
        qualifiedHealthPlanExpenses: 12000,
        form5884Credit: 0
      }
    }
  },
  quarterlyEmployeeCounts: {
    2020: { Q1: 25, Q2: 20, Q3: 20, Q4: 22 },
    2021: { Q1: 22, Q2: 22, Q3: 22, Q4: 22 }
  },
  quarterlyTaxableWages: {
    2020: { Q1: 375000, Q2: 300000, Q3: 310000, Q4: 340000 },
    2021: { Q1: 350000, Q2: 355000, Q3: 360000, Q4: 365000 }
  },
  form940Data: {
    2020: {
      totalPayments: 1325000,
      exemptPayments: 0,
      exemptPaymentsBreakdown: {
        retirement: 0,
        groupLifeInsurance: 0,
        dependentCare: 0,
        other: 0
      },
      excessPayments: 0,
      subtotal: 1325000,
      taxableFutaWages: 175000,
      futaTax: 1050
    },
    2021: {
      totalPayments: 1430000,
      exemptPayments: 0,
      exemptPaymentsBreakdown: {
        retirement: 0,
        groupLifeInsurance: 0,
        dependentCare: 0,
        other: 0
      },
      excessPayments: 0,
      subtotal: 1430000,
      taxableFutaWages: 154000,
      futaTax: 924
    }
  },
  statePayrollTaxes: {
    2020: {
      Q1: { suiTaxableWages: 175000, suiTaxRate: 0.034, suiTaxAmount: 5950, sdiTaxableWages: 0, sdiTaxAmount: 0 },
      Q2: { suiTaxableWages: 0, suiTaxRate: 0.034, suiTaxAmount: 0, sdiTaxableWages: 0, sdiTaxAmount: 0 },
      Q3: { suiTaxableWages: 0, suiTaxRate: 0.034, suiTaxAmount: 0, sdiTaxableWages: 0, sdiTaxAmount: 0 },
      Q4: { suiTaxableWages: 0, suiTaxRate: 0.034, suiTaxAmount: 0, sdiTaxableWages: 0, sdiTaxAmount: 0 }
    },
    2021: {
      Q1: { suiTaxableWages: 154000, suiTaxRate: 0.034, suiTaxAmount: 5236, sdiTaxableWages: 0, sdiTaxAmount: 0 },
      Q2: { suiTaxableWages: 0, suiTaxRate: 0.034, suiTaxAmount: 0, sdiTaxableWages: 0, sdiTaxAmount: 0 },
      Q3: { suiTaxableWages: 0, suiTaxRate: 0.034, suiTaxAmount: 0, sdiTaxableWages: 0, sdiTaxAmount: 0 },
      Q4: { suiTaxableWages: 0, suiTaxRate: 0.034, suiTaxAmount: 0, sdiTaxableWages: 0, sdiTaxAmount: 0 }
    }
  },
  metadata: {
    extractionDate: new Date(),
    templateVersion: '1.0',
    validationStatus: 'valid'
  }
};

// Run tests
console.log('Testing ERC Portal Export...\n');

// Test 1: Validate source data
console.log('1. Validating source data...');
const sourceValidation = ERCPortalMapper.validateSourceData(sampleData);
console.log(`   Valid: ${sourceValidation.valid}`);
if (!sourceValidation.valid) {
  console.log(`   Missing fields: ${sourceValidation.missing.join(', ')}`);
}

// Test 2: Transform to portal format
console.log('\n2. Transforming to portal format...');
const portalResult = ERCPortalMapper.transformToPortalFormat(sampleData);
console.log(`   Success: ${portalResult.success}`);
console.log(`   Field count: ${portalResult.fieldCount}`);
if (portalResult.errors) {
  console.log(`   Errors: ${portalResult.errors.join(', ')}`);
}

// Test 3: Display first 10 fields
if (portalResult.success && portalResult.rowData) {
  console.log('\n3. First 10 portal fields:');
  const fields = getAllPortalFields();
  for (let i = 0; i < 10 && i < fields.length; i++) {
    console.log(`   ${fields[i].fieldName}: ${portalResult.rowData[i]}`);
  }
}

// Test 4: Generate preview
console.log('\n4. Generating preview...');
const preview = ERCPortalMapper.generatePreview(sampleData, 5);
if (preview.success) {
  console.log('   Preview:');
  console.log(preview.data?.split('\n').map(line => '   ' + line).join('\n'));
}

// Test 5: Field summary
console.log('\n5. Portal field summary:');
const summary = ERCPortalMapper.getFieldSummary();
console.log(`   Total fields: ${summary.length}`);
console.log(`   Required fields: ${summary.filter(f => f.required).length}`);
console.log(`   Optional fields: ${summary.filter(f => !f.required).length}`);

// Test 6: Generate file
console.log('\n6. Generating portal file...');
const fileBuffer = ERCPortalMapper.generatePortalFile(sampleData);
if (fileBuffer) {
  console.log(`   File size: ${fileBuffer.length} bytes`);
  console.log(`   First line: ${fileBuffer.toString('utf-8').split('\n')[0].substring(0, 100)}...`);
}

console.log('\n✅ Portal export testing complete!');