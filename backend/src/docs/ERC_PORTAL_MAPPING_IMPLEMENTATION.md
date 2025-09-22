# ERC Portal Mapping Implementation

## Overview
Successfully implemented a comprehensive ERC portal mapping system that transforms extracted ERC data into a 51-field tab-delimited format for portal uploads.

## Implementation Details

### 1. Core Files Created

#### `/backend/src/config/ercPortalConfig.ts`
- Defines all 51 portal fields with their mappings
- Includes helper functions for formatting (currency, percentage, date, boolean)
- Complex field generators for:
  - Case ID generation (ERC-{EIN}-{DATE})
  - Operational triggers description (aggregates shutdown standards)
  - Hardship description (summarizes COVID-19 impacts)
  - Revenue decline calculations

#### `/backend/src/services/ercPortalMapper.ts`
- Main service class for portal transformations
- Key methods:
  - `transformToPortalFormat()` - Converts ERC data to portal format
  - `generatePortalFile()` - Creates tab-delimited file buffer
  - `validateSourceData()` - Ensures all required fields exist
  - `generatePreview()` - Shows first N fields for preview
  - `generateMappingDocumentation()` - Creates field mapping docs

### 2. API Endpoints Added

#### POST `/api/template/export/portal`
- Accepts transformed ERC data
- Validates source data completeness
- Generates tab-delimited file for download
- Returns file with name: `ERC_Portal_Upload_{EIN}_{DATE}.txt`

#### GET `/api/template/portal/fields`
- Returns all 51 field definitions
- Includes full mapping documentation

#### POST `/api/template/export/portal/preview`
- Generates preview of portal export
- Shows first N fields (default: 10)

### 3. Frontend Updates

#### Updated `TemplateProcessor.tsx`
- Added portal export button with gradient styling
- Handles portal export errors gracefully
- Shows missing fields if validation fails
- Automatic filename generation with EIN and date

### 4. Portal Field Categories

The 51 fields are organized into these categories:

1. **Company Information (Fields 1-11)**
   - Case ID, EIN, Legal/Trade names
   - Address details
   - Contact information

2. **Submission Details (Fields 12-14)**
   - Submission date
   - Tax years claiming (2020/2021)

3. **Quarter Claims (Fields 15-20)**
   - Individual quarter eligibility flags

4. **Business Details (Fields 21-25)**
   - Industry code, start date
   - Employee counts by year

5. **Gross Receipts (Fields 26-37)**
   - Quarterly amounts for 2019-2021

6. **PPP Information (Fields 38-41)**
   - Loan and forgiveness amounts

7. **Ownership (Fields 42-43)**
   - Primary owner details

8. **Complex Fields (Fields 44-51)**
   - Operational triggers (aggregated from shutdown standards)
   - Hardship description (generated from multiple sources)
   - Revenue decline percentages
   - Recovery startup status
   - Processing status

## Usage

1. Upload ERC template Excel file
2. System extracts and transforms data
3. Click "Export for Portal Upload (51 Fields)" button
4. File downloads as tab-delimited .txt file
5. Upload file directly to ERC portal

## Testing

Test script at `/backend/src/tests/testPortalExport.ts` validates:
- Source data validation
- Portal transformation
- All 51 fields generation
- File buffer creation

Test results: ✅ All tests passing with 51 fields generated successfully

## Technical Notes

- Tab-delimited format ensures compatibility with portal uploads
- Automatic handling of missing optional fields
- Comprehensive error reporting for missing required fields
- Complex field generation based on business logic
- Proper formatting for all data types (currency, percentage, dates)