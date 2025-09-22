# Excel Template Processing Guide

## Overview
The Excel Template Processing system extracts and transforms data from ERC (Employee Retention Credit) Excel templates into structured, programmatic formats.

## Template Requirements
- **File Format**: Excel (.xlsx or .xls)
- **Sheet Name**: "Understandable Data-final"
- **Template Structure**: Based on "Its In The Box Logistics Inc" format

## Features

### 1. Data Extraction
Automatically extracts:
- Company information (filer remarks, employee counts)
- Qualifying questions (quarterly responses)
- Gross receipts (2019-2021 by quarter)
- Form 941 data (wages, taxes, credits)
- Form 940 data (FUTA calculations)
- State payroll taxes

### 2. Data Transformation
Organizes extracted data into:
- Time-series structures (by year and quarter)
- Logical groupings (forms, taxes, receipts)
- Calculated metrics (decline percentages, eligible quarters)

### 3. Export Options
- **JSON**: Structured data for APIs
- **CSV**: For spreadsheet analysis
- **Excel**: Multi-sheet workbook format

## Usage

### Frontend
1. Navigate to the app
2. Upload your CSV/XLSX file with sheet URLs
3. Select "Process ERC Template" mode
4. Drag and drop your Excel template
5. Review extracted data across tabs
6. Export in your preferred format

### Backend API

#### Extract Data
```bash
POST /api/template/extract
Content-Type: multipart/form-data
Body: file (Excel file)
```

#### Transform Data
```bash
POST /api/template/transform
Content-Type: application/json
Body: { extractedData: {...} }
```

#### Batch Processing
```bash
POST /api/template/batch
Content-Type: multipart/form-data
Body: files[] (multiple Excel files)
```

#### Export Data
```bash
POST /api/template/export/:format
Formats: json, csv, xlsx
Body: { data: {...} }
```

### Testing
Run the test script:
```bash
npm run test:template
```

Or directly:
```bash
npx ts-node src/scripts/testTemplateExtraction.ts
```

## Data Structure

### Extracted Data Example
```json
{
  "companyInfo": {
    "filerRemarks": "Insert your remarks here",
    "fullTimeW2Count2020": 35,
    "fullTimeW2Count2021": 40
  },
  "grossReceipts": {
    "2019": { "Q1": 1005325, "Q2": 786256, "Q3": 856236, "Q4": 1125253 },
    "2020": { "Q1": 758562, "Q2": 235826, "Q3": 358232, "Q4": 658126 },
    "2021": { "Q1": 758256, "Q2": 825698, "Q3": 1125862, "Q4": 1358965 }
  },
  "form941Data": {
    "2020": {
      "Q3": {
        "employeeCount": 32,
        "totalWages": 398250,
        "retentionCreditWages": 85632
      }
    }
  }
}
```

### Calculated Metrics
- Gross receipts decline percentages
- Average employee count
- Total retention credit wages
- Eligible quarters determination

## Configuration

The template mapping is defined in:
`/backend/src/config/ercTemplateConfig.ts`

To adapt for different templates:
1. Update cell mappings in the config
2. Adjust data types as needed
3. Add new sections if required

## Error Handling
- Missing fields are tracked and reported
- Warnings for empty cells
- Validation for data types
- Detailed error messages for debugging