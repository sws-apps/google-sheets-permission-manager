import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ExcelTemplateParser } from '../services/excelTemplateParser';
import { FlexibleTemplateParser } from '../services/flexibleTemplateParser';
import { DataTransformer } from '../services/dataTransformer';
import { ERCPortalMapper } from '../services/ercPortalMapper';
import { ERCBulkUploadMapper } from '../services/ercBulkUploadMapper';
import { SheetsToExcelConverter } from '../services/sheetsToExcelConverter';
import { PublicSheetsConverter } from '../services/publicSheetsConverter';
import { getServiceAccountEmail } from '../services/googleServiceAccount';
import * as XLSX from 'xlsx';
import { exportToSingleTabExcel, exportToSingleCSV } from '../utils/singleTabExporter';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  }
});

/**
 * Extract data from uploaded Excel template
 */
router.post('/extract', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    let parser: ExcelTemplateParser | FlexibleTemplateParser = new ExcelTemplateParser();
    
    // Load the file
    const loaded = await parser.loadFile(req.file.buffer);
    if (!loaded) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to load Excel file',
        details: parser['errors']
      });
    }

    // Try standard extraction first
    let extractionResult = parser.extractData();
    
    // If standard extraction fails, try flexible parser
    if (!extractionResult.success && extractionResult.errors && extractionResult.errors.length > 0) {
      console.log('Standard extraction failed, trying flexible parser...');
      
      parser = new FlexibleTemplateParser();
      await parser.loadFile(req.file.buffer);
      
      try {
        const flexibleData = (parser as FlexibleTemplateParser).extractFlexibleData();
        extractionResult = {
          success: true,
          data: flexibleData,
          warnings: ['Used flexible parser due to non-standard template format']
        };
      } catch (flexError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to extract data with both standard and flexible parsers',
          errors: extractionResult.errors,
          flexibleError: flexError instanceof Error ? flexError.message : 'Unknown error',
          warnings: extractionResult.warnings
        });
      }
    }
    
    if (!extractionResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to extract data',
        errors: extractionResult.errors,
        warnings: extractionResult.warnings
      });
    }

    // Get summary
    const summary = parser.getSummary(extractionResult.data!);
    
    // Validate data
    const validation = parser.validateData(extractionResult.data!);

    res.json({
      success: true,
      data: extractionResult.data,
      summary,
      validation,
      warnings: extractionResult.warnings
    });

  } catch (error) {
    console.error('Error processing template:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process template' 
    });
  }
});

/**
 * Extract data from Google Sheets URL
 */
router.post('/extract-from-sheets', async (req: Request, res: Response) => {
  try {
    const { sheetsUrl } = req.body;
    
    if (!sheetsUrl) {
      return res.status(400).json({
        success: false,
        error: 'Google Sheets URL is required'
      });
    }

    // Validate URL format
    if (!PublicSheetsConverter.isValidGoogleSheetsUrl(sheetsUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google Sheets URL format'
      });
    }

    let excelBuffer: Buffer;
    
    // First try to access as public sheet (no auth needed)
    const publicConverter = new PublicSheetsConverter();
    try {
      console.log('Attempting to access sheet as public (viewer access)...');
      excelBuffer = await publicConverter.convertPublicSheetsToExcel(sheetsUrl);
      console.log('Successfully accessed sheet with public viewer access');
    } catch (publicError) {
      console.log('Public access failed, trying with service account...');
      
      // If public access fails, try with service account auth
      let auth: any;
      try {
        const { getServiceDriveClient } = await import('../services/googleServiceAccount');
        const drive = getServiceDriveClient();
        auth = (drive as any).context._options.auth;
        
        // Try with authentication
        const authConverter = new SheetsToExcelConverter(auth);
        excelBuffer = await authConverter.convertSheetsToExcel(sheetsUrl);
        console.log('Successfully accessed sheet with service account');
      } catch (authError) {
        // If both methods fail, return the public error as it's more relevant
        console.error('Both public and authenticated access failed');
        throw publicError;
      }
    }
    
    // Now process the Excel buffer through the same pipeline as file upload
    let parser: ExcelTemplateParser | FlexibleTemplateParser = new ExcelTemplateParser();
    
    // Load the converted Excel file
    const loaded = await parser.loadFile(excelBuffer);
    if (!loaded) {
      return res.status(400).json({
        success: false,
        error: 'Failed to load converted Excel file',
        details: parser['errors']
      });
    }

    // Try standard extraction first
    let extractionResult = parser.extractData();
    
    // If standard extraction fails, try flexible parser
    if (!extractionResult.success && extractionResult.errors && extractionResult.errors.length > 0) {
      console.log('Standard extraction failed, trying flexible parser...');
      
      parser = new FlexibleTemplateParser();
      await parser.loadFile(excelBuffer);
      
      try {
        const flexibleData = (parser as FlexibleTemplateParser).extractFlexibleData();
        extractionResult = {
          success: true,
          data: flexibleData,
          warnings: ['Used flexible parser due to non-standard template format', 'Sheet was successfully downloaded from Google Sheets']
        };
      } catch (flexError) {
        return res.status(400).json({
          success: false,
          error: 'The Google Sheet was downloaded successfully, but it does not match the expected ERC template format',
          errors: extractionResult.errors,
          flexibleError: flexError instanceof Error ? flexError.message : 'Unknown error',
          warnings: ['Sheet downloaded successfully', 'Expected template: "Its In The Box Logistics Inc" format with sheet "Understandable Data-final"'],
          info: 'Please ensure your Google Sheet contains the proper ERC template structure'
        });
      }
    }
    
    if (!extractionResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to extract data',
        errors: extractionResult.errors,
        warnings: extractionResult.warnings
      });
    }

    // Get summary
    const summary = parser.getSummary(extractionResult.data!);
    
    // Validate data
    const validation = parser.validateData(extractionResult.data!);

    res.json({
      success: true,
      data: extractionResult.data,
      summary,
      validation,
      warnings: extractionResult.warnings,
      source: 'google-sheets'
    });

  } catch (error) {
    console.error('Error processing Google Sheets:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: error.message,
          serviceAccountEmail: getServiceAccountEmail()
        });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process Google Sheets'
    });
  }
});

/**
 * Get service account email for Google Sheets sharing
 */
router.get('/service-account-email', (req: Request, res: Response) => {
  try {
    const email = getServiceAccountEmail();
    if (!email) {
      return res.status(503).json({
        success: false,
        error: 'Service account not configured'
      });
    }
    res.json({
      success: true,
      email
    });
  } catch (error) {
    console.error('Error getting service account email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get service account email'
    });
  }
});

/**
 * Transform extracted data into organized structure
 */
router.post('/transform', async (req: Request, res: Response) => {
  try {
    const { extractedData } = req.body;
    
    if (!extractedData || typeof extractedData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing extracted data'
      });
    }

    // Transform the data
    const transformedData = DataTransformer.transform(extractedData);
    
    // Calculate metrics
    const metrics = DataTransformer.calculateMetrics(transformedData);

    res.json({
      success: true,
      data: transformedData,
      metrics
    });

  } catch (error) {
    console.error('Error transforming data:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to transform data' 
    });
  }
});

/**
 * Process multiple Excel files in batch
 */
router.post('/batch', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No files uploaded' 
      });
    }

    const results = [];
    
    for (const file of files) {
      const parser = new ExcelTemplateParser();
      
      try {
        // Load and extract
        const loaded = await parser.loadFile(file.buffer);
        if (!loaded) {
          results.push({
            filename: file.originalname,
            success: false,
            error: 'Failed to load file'
          });
          continue;
        }

        const extractionResult = parser.extractData();
        
        if (!extractionResult.success) {
          results.push({
            filename: file.originalname,
            success: false,
            error: 'Failed to extract data',
            errors: extractionResult.errors
          });
          continue;
        }

        // Transform data
        const transformedData = DataTransformer.transform(extractionResult.data!);
        const metrics = DataTransformer.calculateMetrics(transformedData);

        results.push({
          filename: file.originalname,
          success: true,
          data: transformedData,
          metrics,
          warnings: extractionResult.warnings
        });

      } catch (error) {
        results.push({
          filename: file.originalname,
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed'
        });
      }
    }

    // Summary
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      results
    });

  } catch (error) {
    console.error('Error in batch processing:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Batch processing failed' 
    });
  }
});

/**
 * Export transformed data to portal format (51-field tab-delimited)
 * NOTE: This route must be defined BEFORE /export/:format to avoid route conflict
 */
router.post('/export/portal', async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    
    console.log('Portal export request received');
    console.log('Data keys:', data ? Object.keys(data) : 'No data');
    
    if (!data || typeof data !== 'object') {
      console.error('Portal export: Invalid or missing data');
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing transformed data'
      });
    }

    // Validate source data first
    const sourceValidation = ERCPortalMapper.validateSourceData(data);
    if (!sourceValidation.valid) {
      console.error('Portal export validation failed:', sourceValidation.missing);
      return res.status(400).json({
        success: false,
        error: 'Source data validation failed',
        missingFields: sourceValidation.missing
      });
    }

    // Transform to portal format
    const portalResult = ERCPortalMapper.transformToPortalFormat(data);
    
    if (!portalResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Portal transformation failed',
        errors: portalResult.errors
      });
    }

    // Generate file buffer
    const fileBuffer = ERCPortalMapper.generatePortalFile(data);
    
    if (!fileBuffer) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate portal file'
      });
    }

    // Send as downloadable file
    const filename = `ERC_Portal_Upload_${data.companyInfo?.ein?.replace(/-/g, '') || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error exporting to portal format:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Portal export failed' 
    });
  }
});

/**
 * Export transformed data to bulk upload format (52-field CSV)
 * NOTE: This route must be defined BEFORE /export/:format to avoid route conflict
 */
router.post('/export/bulk-upload', async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    
    console.log('Bulk upload export request received');
    console.log('Data keys:', data ? Object.keys(data) : 'No data');
    
    if (!data || typeof data !== 'object') {
      console.error('Bulk upload export: Invalid or missing data');
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing transformed data'
      });
    }

    // Validate source data first
    const sourceValidation = ERCBulkUploadMapper.validateSourceData(data);
    if (!sourceValidation.valid) {
      console.error('Bulk upload export validation failed:', sourceValidation.missing);
      return res.status(400).json({
        success: false,
        error: 'Source data validation failed',
        missingFields: sourceValidation.missing
      });
    }

    // Transform to bulk upload format
    const bulkUploadResult = ERCBulkUploadMapper.transformToBulkUploadFormat(data);
    
    if (!bulkUploadResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Bulk upload transformation failed',
        errors: bulkUploadResult.errors
      });
    }

    // Generate file buffer
    const fileBuffer = ERCBulkUploadMapper.generateBulkUploadFile(data);
    
    if (!fileBuffer) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate bulk upload file'
      });
    }

    // Send as downloadable file
    const filename = `customer_bulk_upload_${data.companyInfo?.ein?.replace(/-/g, '') || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error exporting to bulk upload format:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Bulk upload export failed' 
    });
  }
});

/**
 * Export transformed data in various formats
 */
router.post('/export/:format', async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing data'
      });
    }

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="erc-data.json"');
        res.json(data);
        break;

      case 'csv':
        const csv = exportToSingleCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="erc-complete-data.csv"');
        res.send(csv);
        break;

      case 'xlsx':
        const workbook = exportToSingleTabExcel(data);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="erc-complete-data.xlsx"');
        res.send(buffer);
        break;

      default:
        res.status(400).json({
          success: false,
          error: `Unsupported export format: ${format}. Supported formats: json, csv, xlsx`
        });
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    });
  }
});

/**
 * Get portal field mapping information
 */
router.get('/portal/fields', (req: Request, res: Response) => {
  try {
    const fields = ERCPortalMapper.getFieldSummary();
    const documentation = ERCPortalMapper.generateMappingDocumentation();
    
    res.json({
      success: true,
      totalFields: fields.length,
      fields,
      documentation
    });
  } catch (error) {
    console.error('Error getting portal field info:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get field information' 
    });
  }
});

/**
 * Preview portal export data
 */
router.post('/export/portal/preview', async (req: Request, res: Response) => {
  try {
    const { data, fieldCount = 10 } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing transformed data'
      });
    }

    // Generate preview
    const preview = ERCPortalMapper.generatePreview(data, fieldCount);
    
    res.json({
      success: preview.success,
      preview: preview.data,
      fieldCount: preview.fieldCount,
      errors: preview.errors
    });

  } catch (error) {
    console.error('Error generating portal preview:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Preview generation failed' 
    });
  }
});

/**
 * Get template structure information
 */
router.get('/template-info', (req: Request, res: Response) => {
  res.json({
    success: true,
    templateInfo: {
      sheetName: 'Understandable Data-final',
      sections: [
        'filerRemarks',
        'employeeInfo',
        'qualifyingQuestions',
        'grossIncome',
        'form941',
        'form940',
        'statePayrollTaxes'
      ],
      supportedYears: [2019, 2020, 2021],
      supportedQuarters: ['Q1', 'Q2', 'Q3', 'Q4']
    }
  });
});

/**
 * Get sample data for testing/demo purposes
 */
router.get('/sample-data', (req: Request, res: Response) => {
  try {
    const { sampleERCData } = require('../data/sampleERCData');
    
    // Calculate metrics for the sample data
    const totalRetentionCreditWages = 
      (sampleERCData.form941Data?.[2020]?.Q2?.retentionCreditWages || 0) +
      (sampleERCData.form941Data?.[2020]?.Q3?.retentionCreditWages || 0) +
      (sampleERCData.form941Data?.[2020]?.Q4?.retentionCreditWages || 0) +
      (sampleERCData.form941Data?.[2021]?.Q1?.retentionCreditWages || 0) +
      (sampleERCData.form941Data?.[2021]?.Q2?.retentionCreditWages || 0) +
      (sampleERCData.form941Data?.[2021]?.Q3?.retentionCreditWages || 0);
    
    const averageEmployeeCount = Math.round(
      ((sampleERCData.companyInfo?.fullTimeW2Count2019 || 0) +
       (sampleERCData.companyInfo?.fullTimeW2Count2020 || 0) +
       (sampleERCData.companyInfo?.fullTimeW2Count2021 || 0)) / 3
    );
    
    // Determine eligible quarters based on qualifying questions
    const eligibleQuarters: any = {
      2020: {},
      2021: {}
    };
    
    // Check 2020 quarters
    for (const quarter of ['Q1', 'Q2', 'Q3', 'Q4']) {
      const q = sampleERCData.qualifyingQuestions?.[2020]?.[quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4'];
      eligibleQuarters[2020][quarter] = q && (
        q.governmentShutdown || 
        q.revenueReduction20Percent || 
        q.revenueReduction10Percent ||
        q.supplyDisruptions ||
        q.inabilityToMeet
      );
    }
    
    // Check 2021 quarters
    for (const quarter of ['Q1', 'Q2', 'Q3']) {
      const q = sampleERCData.qualifyingQuestions?.[2021]?.[quarter as 'Q1' | 'Q2' | 'Q3'];
      eligibleQuarters[2021][quarter] = q && (
        q.governmentShutdown || 
        q.revenueReduction20Percent || 
        q.revenueReduction10Percent ||
        q.supplyDisruptions ||
        q.inabilityToMeet
      );
    }
    
    res.json({
      success: true,
      data: sampleERCData,
      validation: {
        isValid: true,
        missingFields: [],
        invalidFields: []
      },
      warnings: ['Using sample data for demonstration purposes'],
      metrics: {
        averageEmployeeCount,
        totalRetentionCreditWages,
        eligibleQuarters
      }
    });
  } catch (error) {
    console.error('Error loading sample data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load sample data'
    });
  }
});

// Helper function to export data to CSV
function exportToCSV(data: any): string {
  const rows: string[][] = [];
  
  // Headers
  rows.push(['ERC Data Export']);
  rows.push(['Generated on', new Date().toISOString()]);
  rows.push([]);
  
  // Company Info
  rows.push(['Company Information']);
  rows.push(['Filer Remarks', data.companyInfo?.filerRemarks || '']);
  rows.push(['Full-time W2 Count 2020', data.companyInfo?.fullTimeW2Count2020 || '']);
  rows.push(['Full-time W2 Count 2021', data.companyInfo?.fullTimeW2Count2021 || '']);
  rows.push([]);
  
  // Gross Receipts
  rows.push(['Gross Receipts']);
  rows.push(['Year', 'Q1', 'Q2', 'Q3', 'Q4']);
  
  if (data.grossReceipts) {
    ['2019', '2020', '2021'].forEach(year => {
      const yearData = data.grossReceipts[year];
      if (yearData) {
        rows.push([
          year,
          yearData.Q1?.toString() || '0',
          yearData.Q2?.toString() || '0',
          yearData.Q3?.toString() || '0',
          yearData.Q4?.toString() || '0'
        ]);
      }
    });
  }
  
  rows.push([]);
  
  // Form 941 Summary
  rows.push(['Form 941 - Employee Retention Credit Wages']);
  rows.push(['Year', 'Quarter', 'Employee Count', 'Total Wages', 'Retention Credit Wages']);
  
  if (data.form941Data) {
    ['2020', '2021'].forEach(year => {
      const yearData = data.form941Data[year];
      if (yearData) {
        ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
          const qData = yearData[quarter];
          if (qData) {
            rows.push([
              year,
              quarter,
              qData.employeeCount?.toString() || '0',
              qData.totalWages?.toString() || '0',
              qData.retentionCreditWages?.toString() || '0'
            ]);
          }
        });
      }
    });
  }
  
  // Convert to CSV string
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Helper function to export data to Excel
function exportToExcel(data: any): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // Company Info Sheet
  const companyData = [
    ['Company Information'],
    ['Filer Remarks', data.companyInfo?.filerRemarks || ''],
    ['Full-time W2 Count 2020', data.companyInfo?.fullTimeW2Count2020 || 0],
    ['Full-time W2 Count 2021', data.companyInfo?.fullTimeW2Count2021 || 0]
  ];
  const companySheet = XLSX.utils.aoa_to_sheet(companyData);
  XLSX.utils.book_append_sheet(workbook, companySheet, 'Company Info');
  
  // Gross Receipts Sheet
  const grossReceiptsData = [
    ['Gross Receipts'],
    ['Year', 'Q1', 'Q2', 'Q3', 'Q4']
  ];
  
  if (data.grossReceipts) {
    ['2019', '2020', '2021'].forEach(year => {
      const yearData = data.grossReceipts[year];
      if (yearData) {
        grossReceiptsData.push([
          year,
          yearData.Q1 || 0,
          yearData.Q2 || 0,
          yearData.Q3 || 0,
          yearData.Q4 || 0
        ]);
      }
    });
  }
  
  const grossReceiptsSheet = XLSX.utils.aoa_to_sheet(grossReceiptsData);
  XLSX.utils.book_append_sheet(workbook, grossReceiptsSheet, 'Gross Receipts');
  
  // Form 941 Sheet
  const form941Data = [
    ['Form 941 Data'],
    ['Year', 'Quarter', 'Employees', 'Total Wages', 'Fed Tax Withheld', 
     'Sick Wages', 'Family Leave', 'Retention Credit Wages', 'Health Expenses']
  ];
  
  if (data.form941Data) {
    ['2020', '2021'].forEach(year => {
      const yearData = data.form941Data[year];
      if (yearData) {
        ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
          const qData = yearData[quarter];
          if (qData) {
            form941Data.push([
              year,
              quarter,
              qData.employeeCount || 0,
              qData.totalWages || 0,
              qData.federalTaxWithheld || 0,
              qData.qualifiedSickWages || 0,
              qData.qualifiedFamilyLeaveWages || 0,
              qData.retentionCreditWages || 0,
              qData.qualifiedHealthPlanExpenses || 0
            ]);
          }
        });
      }
    });
  }
  
  const form941Sheet = XLSX.utils.aoa_to_sheet(form941Data);
  XLSX.utils.book_append_sheet(workbook, form941Sheet, 'Form 941');
  
  return workbook;
}

export default router;