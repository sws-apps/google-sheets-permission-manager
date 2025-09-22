// ERC Template Configuration
// Defines the cell mapping for the "Its In The Box Logistics Inc" Excel template

export interface CellMapping {
  cell: string;
  mappingType: 'TEMPLATE_LABEL' | 'DATA_VALUE' | 'HEADER';
  dataType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'PERCENTAGE';
  fieldName: string;
  description?: string;
}

export interface TemplateSection {
  name: string;
  mappings: CellMapping[];
}

export const ERC_TEMPLATE_CONFIG = {
  sheetName: 'Understandable Data-final',
  sections: [
    {
      name: 'filerRemarks',
      mappings: [
        { cell: 'A1', mappingType: 'HEADER', dataType: 'TEXT', fieldName: 'filerRemarksHeader' },
        { cell: 'A2', mappingType: 'DATA_VALUE', dataType: 'TEXT', fieldName: 'filerRemarks' }
      ]
    },
    {
      name: 'employeeInfo',
      mappings: [
        { cell: 'K7', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'fullTimeW2Label' },
        { cell: 'K8', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'fullTimeW2Count2020' },
        { cell: 'L8', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'fullTimeW2Count2021' },
        { cell: 'K20', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'employeeInfoHeader' },
        { cell: 'K21', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'fullTimeEmployeesLabel' }
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
        
        // Supply disruptions - Row 10
        { cell: 'A10', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'supplyDisruptionQuestion' },
        { cell: 'B10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q1_2020' },
        { cell: 'C10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q2_2020' },
        { cell: 'D10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q3_2020' },
        { cell: 'E10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q4_2020' },
        { cell: 'F10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q1_2021' },
        { cell: 'G10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q2_2021' },
        { cell: 'H10', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'supply_q3_2021' },
        
        // 10% reduction - Row 11
        { cell: 'A11', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'reduction10Question' },
        { cell: 'B11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q1_2020' },
        { cell: 'C11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q2_2020' },
        { cell: 'D11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q3_2020' },
        { cell: 'E11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q4_2020' },
        { cell: 'F11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q1_2021' },
        { cell: 'G11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q2_2021' },
        { cell: 'H11', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction10_q3_2021' },
        
        // 20% reduction - Row 12
        { cell: 'A12', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'reduction20Question' },
        { cell: 'B12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q1_2020' },
        { cell: 'C12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q2_2020' },
        { cell: 'D12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q3_2020' },
        { cell: 'E12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q4_2020' },
        { cell: 'F12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q1_2021' },
        { cell: 'G12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q2_2021' },
        { cell: 'H12', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'reduction20_q3_2021' },
        
        // Recovery startup - Row 13
        { cell: 'A13', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'recoveryStartupQuestion' },
        { cell: 'B13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q1_2020' },
        { cell: 'C13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q2_2020' },
        { cell: 'D13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q3_2020' },
        { cell: 'E13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q4_2020' },
        { cell: 'F13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q1_2021' },
        { cell: 'G13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q2_2021' },
        { cell: 'H13', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'recovery_q3_2021' },
        
        // Severely distressed - Row 14
        { cell: 'A14', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'severelyDistressedQuestion' },
        { cell: 'B14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q1_2020' },
        { cell: 'C14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q2_2020' },
        { cell: 'D14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q3_2020' },
        { cell: 'E14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q4_2020' },
        { cell: 'F14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q1_2021' },
        { cell: 'G14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q2_2021' },
        { cell: 'H14', mappingType: 'DATA_VALUE', dataType: 'BOOLEAN', fieldName: 'distressed_q3_2021' }
      ]
    },
    {
      name: 'grossIncome',
      mappings: [
        { cell: 'K25', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'grossIncomeHeader' },
        { cell: 'K26', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'grossReceipts2019Question' },
        { cell: 'K27', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'quarterlyDeclineQuestion' },
        
        // 2019 Gross Receipts
        { cell: 'K30', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2019Label' },
        { cell: 'A31', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B31', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2019_q1' },
        { cell: 'A32', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B32', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2019_q2' },
        { cell: 'A33', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B33', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2019_q3' },
        { cell: 'A34', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B34', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2019_q4' },
        
        // 2020 Gross Receipts
        { cell: 'K37', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2020Label' },
        { cell: 'A38', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B38', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2020_q1' },
        { cell: 'A39', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B39', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2020_q2' },
        { cell: 'A40', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B40', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2020_q3' },
        { cell: 'A41', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B41', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2020_q4' },
        
        // 2021 Gross Receipts
        { cell: 'K44', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2021Label' },
        { cell: 'A45', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B45', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2021_q1' },
        { cell: 'A46', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B46', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2021_q2' },
        { cell: 'A47', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B47', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2021_q3' },
        { cell: 'A48', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B48', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'gross_2021_q4' }
      ]
    },
    {
      name: 'form941',
      mappings: [
        { cell: 'K52', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'form941Header' },
        { cell: 'K57', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'ercAmountClaimedLabel' },
        { cell: 'K58', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'dateFiledLabel' },
        
        // 2020 Form 941 Headers
        { cell: 'A61', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2020Label' },
        { cell: 'B62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'numEmployeesDesc' },
        { cell: 'C62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'totalWagesDesc' },
        { cell: 'D62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'fedTaxWithheldDesc' },
        { cell: 'E62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'qualifiedSickWagesDesc' },
        { cell: 'F62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'qualifiedFamilyLeaveDesc' },
        { cell: 'G62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'retentionCreditWagesDesc' },
        { cell: 'H62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'healthPlanExpensesDesc' },
        { cell: 'I62', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'form5884CreditDesc' },
        
        // 2020 Q1 Data
        { cell: 'A63', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_employees' },
        { cell: 'C63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_wages' },
        { cell: 'D63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_fedTax' },
        { cell: 'E63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_sickWages' },
        { cell: 'F63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_familyLeave' },
        { cell: 'G63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_retentionWages' },
        { cell: 'H63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_healthExpenses' },
        { cell: 'I63', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q1_form5884' },
        
        // 2020 Q2 Data
        { cell: 'A64', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_employees' },
        { cell: 'C64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_wages' },
        { cell: 'D64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_fedTax' },
        { cell: 'E64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_sickWages' },
        { cell: 'F64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_familyLeave' },
        { cell: 'G64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_retentionWages' },
        { cell: 'H64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_healthExpenses' },
        { cell: 'I64', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q2_form5884' },
        
        // 2020 Q3 Data
        { cell: 'A65', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_employees' },
        { cell: 'C65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_wages' },
        { cell: 'D65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_fedTax' },
        { cell: 'E65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_sickWages' },
        { cell: 'F65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_familyLeave' },
        { cell: 'G65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_retentionWages' },
        { cell: 'H65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_healthExpenses' },
        { cell: 'I65', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q3_form5884' },
        
        // 2020 Q4 Data
        { cell: 'A66', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_employees' },
        { cell: 'C66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_wages' },
        { cell: 'D66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_fedTax' },
        { cell: 'E66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_sickWages' },
        { cell: 'F66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_familyLeave' },
        { cell: 'G66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_retentionWages' },
        { cell: 'H66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_healthExpenses' },
        { cell: 'I66', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2020_q4_form5884' },
        
        // 2021 Form 941 Data
        { cell: 'A69', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2021Label' },
        
        // 2021 Q1 Data
        { cell: 'A71', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_employees' },
        { cell: 'C71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_wages' },
        { cell: 'D71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_fedTax' },
        { cell: 'E71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_sickWages' },
        { cell: 'F71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_familyLeave' },
        { cell: 'G71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_retentionWages' },
        { cell: 'H71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_healthExpenses' },
        { cell: 'I71', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q1_form5884' },
        
        // 2021 Q2 Data
        { cell: 'A72', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_employees' },
        { cell: 'C72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_wages' },
        { cell: 'D72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_fedTax' },
        { cell: 'E72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_sickWages' },
        { cell: 'F72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_familyLeave' },
        { cell: 'G72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_retentionWages' },
        { cell: 'H72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_healthExpenses' },
        { cell: 'I72', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q2_form5884' },
        
        // 2021 Q3 Data
        { cell: 'A73', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_employees' },
        { cell: 'C73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_wages' },
        { cell: 'D73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_fedTax' },
        { cell: 'E73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_sickWages' },
        { cell: 'F73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_familyLeave' },
        { cell: 'G73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_retentionWages' },
        { cell: 'H73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_healthExpenses' },
        { cell: 'I73', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q3_form5884' },
        
        // 2021 Q4 Data
        { cell: 'A74', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_employees' },
        { cell: 'C74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_wages' },
        { cell: 'D74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_fedTax' },
        { cell: 'E74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_sickWages' },
        { cell: 'F74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_familyLeave' },
        { cell: 'G74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_retentionWages' },
        { cell: 'H74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_healthExpenses' },
        { cell: 'I74', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form941_2021_q4_form5884' }
      ]
    },
    {
      name: 'form940',
      mappings: [
        { cell: 'K77', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'form940Header' },
        
        // 2020 Form 940
        { cell: 'A82', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2020Label' },
        { cell: 'C82', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'columnALabel' },
        { cell: 'D82', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'columnBLabel' },
        { cell: 'B83', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'lineLabel' },
        { cell: 'C83', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'descriptionLabel' },
        { cell: 'D83', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'amountLabel' },
        
        // Line 3 - Total payments
        { cell: 'B84', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line3Label' },
        { cell: 'C84', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'totalPaymentsDesc' },
        { cell: 'D84', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_totalPayments' },
        
        // Line 4 - Exempt payments
        { cell: 'B85', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4Label' },
        { cell: 'C85', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'exemptPaymentsDesc' },
        { cell: 'D85', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_exemptPayments' },
        
        // Line 4 subcategories
        { cell: 'B87', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4bLabel' },
        { cell: 'C87', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'retirementPensionDesc' },
        { cell: 'D87', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_retirement' },
        
        { cell: 'B88', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4cLabel' },
        { cell: 'C88', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'groupLifeInsuranceDesc' },
        { cell: 'D88', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_groupLife' },
        
        { cell: 'B89', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4dLabel' },
        { cell: 'C89', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'dependentCareDesc' },
        { cell: 'D89', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_dependentCare' },
        
        { cell: 'B90', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4eLabel' },
        { cell: 'C90', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'otherDesc' },
        { cell: 'D90', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_other' },
        
        // Line 5 - Excess payments
        { cell: 'B91', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line5Label' },
        { cell: 'C91', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'excessPaymentsDesc' },
        { cell: 'D91', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_excessPayments' },
        
        // Line 6 - Subtotal
        { cell: 'B92', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line6Label' },
        { cell: 'C92', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'subtotalDesc' },
        { cell: 'D92', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_subtotal' },
        
        // Line 7 - Taxable FUTA wages
        { cell: 'B93', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line7Label' },
        { cell: 'C93', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'taxableFutaWagesDesc' },
        { cell: 'D93', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_taxableFutaWages' },
        
        // Line 8 - FUTA tax
        { cell: 'B94', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line8Label' },
        { cell: 'C94', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'futaTaxDesc' },
        { cell: 'D94', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2020_futaTax' },
        
        // 2021 Form 940
        { cell: 'A96', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2021Label' },
        
        // Line 3 - Total payments
        { cell: 'B98', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line3Label' },
        { cell: 'C98', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'totalPaymentsDesc' },
        { cell: 'D98', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_totalPayments' },
        
        // Line 4 - Exempt payments
        { cell: 'B99', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4Label' },
        { cell: 'C99', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'exemptPaymentsDesc' },
        { cell: 'D99', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_exemptPayments' },
        
        // Line 4 subcategories
        { cell: 'B101', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4bLabel' },
        { cell: 'C101', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'retirementPensionDesc' },
        { cell: 'D101', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_retirement' },
        
        { cell: 'B102', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4cLabel' },
        { cell: 'C102', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'groupLifeInsuranceDesc' },
        { cell: 'D102', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_groupLife' },
        
        { cell: 'B103', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4dLabel' },
        { cell: 'C103', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'dependentCareDesc' },
        { cell: 'D103', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_dependentCare' },
        
        { cell: 'B104', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line4eLabel' },
        { cell: 'C104', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'otherDesc' },
        { cell: 'D104', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_other' },
        
        // Line 5 - Excess payments
        { cell: 'B105', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line5Label' },
        { cell: 'C105', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'excessPaymentsDesc' },
        { cell: 'D105', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_excessPayments' },
        
        // Line 6 - Subtotal
        { cell: 'B106', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line6Label' },
        { cell: 'C106', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'subtotalDesc' },
        { cell: 'D106', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_subtotal' },
        
        // Line 7 - Taxable FUTA wages
        { cell: 'B107', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line7Label' },
        { cell: 'C107', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'taxableFutaWagesDesc' },
        { cell: 'D107', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_taxableFutaWages' },
        
        // Line 8 - FUTA tax
        { cell: 'B108', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'line8Label' },
        { cell: 'C108', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'futaTaxDesc' },
        { cell: 'D108', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'form940_2021_futaTax' }
      ]
    },
    {
      name: 'statePayrollTaxes',
      mappings: [
        { cell: 'K111', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'statePayrollTaxesHeader' },
        
        // 2020 State Payroll Taxes
        { cell: 'K116', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2020Label' },
        { cell: 'A117', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'quarterLabel' },
        { cell: 'B117', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'caSuiTaxableWagesLabel' },
        { cell: 'C117', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'caSuiTaxRateLabel' },
        { cell: 'D117', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'caSuiTaxAmountLabel' },
        { cell: 'E117', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'caSdiTaxableWagesLabel' },
        { cell: 'F117', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'caSdiTaxAmountLabel' },
        
        // 2020 Q1
        { cell: 'A118', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B118', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q1_suiWages' },
        { cell: 'C118', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2020_q1_suiRate' },
        { cell: 'D118', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q1_suiTax' },
        { cell: 'E118', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q1_sdiWages' },
        { cell: 'F118', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q1_sdiTax' },
        
        // 2020 Q2
        { cell: 'A119', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B119', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q2_suiWages' },
        { cell: 'C119', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2020_q2_suiRate' },
        { cell: 'D119', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q2_suiTax' },
        { cell: 'E119', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q2_sdiWages' },
        { cell: 'F119', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q2_sdiTax' },
        
        // 2020 Q3
        { cell: 'A120', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B120', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q3_suiWages' },
        { cell: 'C120', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2020_q3_suiRate' },
        { cell: 'D120', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q3_suiTax' },
        { cell: 'E120', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q3_sdiWages' },
        { cell: 'F120', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q3_sdiTax' },
        
        // 2020 Q4
        { cell: 'A121', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B121', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q4_suiWages' },
        { cell: 'C121', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2020_q4_suiRate' },
        { cell: 'D121', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q4_suiTax' },
        { cell: 'E121', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q4_sdiWages' },
        { cell: 'F121', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2020_q4_sdiTax' },
        
        // 2021 State Payroll Taxes
        { cell: 'K124', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'year2021Label' },
        
        // 2021 Q1
        { cell: 'A126', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q1Label' },
        { cell: 'B126', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q1_suiWages' },
        { cell: 'C126', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2021_q1_suiRate' },
        { cell: 'D126', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q1_suiTax' },
        { cell: 'E126', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q1_sdiWages' },
        { cell: 'F126', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q1_sdiTax' },
        
        // 2021 Q2
        { cell: 'A127', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q2Label' },
        { cell: 'B127', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q2_suiWages' },
        { cell: 'C127', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2021_q2_suiRate' },
        { cell: 'D127', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q2_suiTax' },
        { cell: 'E127', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q2_sdiWages' },
        { cell: 'F127', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q2_sdiTax' },
        
        // 2021 Q3
        { cell: 'A128', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q3Label' },
        { cell: 'B128', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q3_suiWages' },
        { cell: 'C128', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2021_q3_suiRate' },
        { cell: 'D128', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q3_suiTax' },
        { cell: 'E128', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q3_sdiWages' },
        { cell: 'F128', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q3_sdiTax' },
        
        // 2021 Q4
        { cell: 'A129', mappingType: 'TEMPLATE_LABEL', dataType: 'TEXT', fieldName: 'q4Label' },
        { cell: 'B129', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q4_suiWages' },
        { cell: 'C129', mappingType: 'DATA_VALUE', dataType: 'PERCENTAGE', fieldName: 'state_2021_q4_suiRate' },
        { cell: 'D129', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q4_suiTax' },
        { cell: 'E129', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q4_sdiWages' },
        { cell: 'F129', mappingType: 'DATA_VALUE', dataType: 'NUMBER', fieldName: 'state_2021_q4_sdiTax' }
      ]
    }
  ] as TemplateSection[]
};

// Helper function to get all DATA_VALUE mappings for easy extraction
export function getDataValueMappings(): CellMapping[] {
  return ERC_TEMPLATE_CONFIG.sections.flatMap(section => 
    section.mappings.filter(mapping => mapping.mappingType === 'DATA_VALUE')
  );
}

// Helper function to get mapping by cell reference
export function getMappingByCell(cell: string): CellMapping | undefined {
  for (const section of ERC_TEMPLATE_CONFIG.sections) {
    const mapping = section.mappings.find(m => m.cell === cell);
    if (mapping) return mapping;
  }
  return undefined;
}

// Helper function to get all mappings for a specific section
export function getSectionMappings(sectionName: string): CellMapping[] {
  const section = ERC_TEMPLATE_CONFIG.sections.find(s => s.name === sectionName);
  return section ? section.mappings : [];
}