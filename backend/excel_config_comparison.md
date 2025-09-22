# Excel Structure vs Configuration Comparison

## Major Discrepancies Found

### 1. Missing Data Sections in Configuration

#### Section 2: Shutdown Standards (Rows 20-32)
**Actual Excel Structure:**
- A20: "2. If Affected by Shutdowns, what standards were followed related to government orders?" → B20: "Answers"
- A21: "Full Shutdowns" → B21: "No"
- A22: "Partial Shutdowns" → B22: "No"
- A23: "Interrupted Operations" → B23: "Yes"
- A24: "Supply Chain Interruptions" → B24: "Yes"
- A25: "Inability to Access Equipment" → B25: "Yes"
- A26: "Limited Capacity to Operate" → B26: "Yes"
- A27: "Inability to work with your vendors" → B27: "Yes"
- A28: "Reduction in Services or Goods offered to your Customer" → B28: "Yes"
- A29: "Cut Down in your hours of operation" → B29: "No"
- A30: "Shifting hours to increase sanitation of your Facility" → B30: "Yes"
- A31: "Challenges in Finding and retaining employees" → B31: "Yes"
- A32: "Other" → B32: "Businesses were closed due to the pandemic and our business was not a"

**Current Config:** NOT MAPPED AT ALL

#### Section 3: Sales & Employee Data (Rows 35-51)
**Actual Excel Structure:**
- Headers at Row 35: B35-F35 show year columns (2019, 2019, 2019, 2019, 2019)
- Row 36: Quarter headers (Quarter 1, Quarter 2, Quarter 3, Quarter 4, Total)
- Row 37: Date ranges
- Row 38: Business Gross Sales - B38: $161,331.57, C38: $172,080.08, D38: $182,007.35, E38: $236,433.066, F38: $751,852.066
- Row 39: "Number of full-time W-2's Issued for your employees" → F39: 13

**Current Config:** Maps these to wrong rows (K30-B48) and wrong structure

#### Section 4: PPP Information (Rows 53-59)
**Actual Excel Structure:**
- A53: "PPP 1 Obtained"
- A54: "if PPP 1 was for given,enter forgivness amount:" → B54: 79515
- A57: "PPP 2 Obtained"
- A58: "If PP2 was forgiven,enter forgiveness amount:" → B58: 130038

**Current Config:** NOT MAPPED AT ALL

#### Section 5: Ownership Structure (Rows 62-64)
**Actual Excel Structure:**
- A63: "Name" → A64: "WILBERT DUDLEY"
- B63: "Percentages" → B64: True (100%)

**Current Config:** NOT MAPPED AT ALL

### 2. Incorrect Cell Mappings in Qualifying Questions

**Issue:** Questions are in different rows than configured
- Config maps A10 as "supplyDisruptionQuestion" but actual A10 is "Did your business have an inability to conduct meetings face to face"
- The actual supply disruption question is at A11: "Did your business suffer from supply chain disruption..."
- Config is missing question at A12: "Did any of your suppliers/vendors suffer from any supply chain disruption..."

### 3. Incorrect Revenue Reduction Questions

**Actual Excel has:**
- A15: "Did your business suffer a revenue reduction of 50% or more in 2020..." → B15: "Yes"
- A16: "Did your business suffer a revenue reduction of 20% or more in 2021..." → B16: "Yes"
- A17: "Do you own any other business..." → B17: "No"

**Config maps:** These questions to wrong rows (A11-A14)

### 4. Missing 941 Form Data from Sheet 4

**Actual 941 sheet has:**
- Company info at A4-D8
- Employee counts at D11-J11
- Taxable wages at D12-J12

**Config:** Only references the "Understandable Data-final" sheet, missing actual 941 data

### 5. Form 940 and State Payroll Taxes

**Current Config:** Maps to rows 77-129
**Actual Excel:** These sections don't exist in the provided data

## Recommendations

1. **Update qualifying questions mapping** to match actual row numbers
2. **Add missing sections:**
   - Shutdown Standards (A20-B32)
   - Sales Data with correct structure (A35-F50)
   - PPP Information (A53-B59)
   - Ownership Structure (A62-B64)
3. **Fix revenue reduction questions** mapping (A15-B17)
4. **Consider using 941 form sheet** for cross-validation
5. **Remove non-existent sections** (Form 940, State Payroll Taxes) or verify they exist in a different version

## Quick Reference: Key Data Locations

### Company Information
- EIN: B25 (Data Dump) or B4 (941 form)
- Company Name: B26 (Data Dump) or B5 (941 form)
- Address: B28-D29 (Data Dump) or B7-D8 (941 form)

### Sales Data (Understandable Data-final)
- 2019: B38-F38 (Row 38)
- 2020: B44-F44 (Row 44)
- 2021: B49-F49 (Row 49)

### Employee Counts
- 2020: F45 = 29, G45 = 20 (from 941)
- 2021: F50 = 33, G50 = 19 (from 941)

### PPP Forgiveness
- PPP1: B54 = $79,515
- PPP2: B58 = $130,038

### Ownership
- Owner: A64 = "WILBERT DUDLEY"
- Percentage: B64 = 100%