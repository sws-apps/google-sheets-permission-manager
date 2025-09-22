import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardHeader,
  TextField,
  InputAdornment,
  Link
} from '@mui/material';
import {
  CloudUpload,
  Transform,
  Download,
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  Info,
  Description,
  ContentCopy,
  Launch
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

// Removed TabPanel - using single view layout

export const TemplateProcessor: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [transformedData, setTransformedData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string | null>(null);
  const [isProcessingSheets, setIsProcessingSheets] = useState(false);
  // Removed tab state - using single view

  const steps = ['Upload Excel Template', 'Extract & Validate', 'Transform & Export'];

  // Fetch service account email on component mount
  useEffect(() => {
    const fetchServiceAccountEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/template/service-account-email`);
        if (response.data.success) {
          setServiceAccountEmail(response.data.email);
        }
      } catch (error) {
        console.error('Failed to fetch service account email:', error);
      }
    };
    fetchServiceAccountEmail();
  }, []);

  const handleSheetsUrlProcess = async () => {
    if (!sheetsUrl.trim()) {
      setErrors(['Please enter a Google Sheets URL']);
      return;
    }

    setIsProcessingSheets(true);
    setErrors([]);
    setWarnings([]);

    try {
      // Extract data from Google Sheets
      const extractResponse = await axios.post(`${API_BASE_URL}/api/template/extract-from-sheets`, {
        sheetsUrl: sheetsUrl.trim()
      });

      if (extractResponse.data.success) {
        setExtractedData(extractResponse.data.data);
        setValidation(extractResponse.data.validation);
        setWarnings(extractResponse.data.warnings || []);
        setActiveStep(1);

        // Automatically transform if extraction was successful
        const transformResponse = await axios.post(`${API_BASE_URL}/api/template/transform`, {
          extractedData: extractResponse.data.data
        });

        if (transformResponse.data.success) {
          setTransformedData(transformResponse.data.data);
          setMetrics(transformResponse.data.metrics);
          setActiveStep(2);
        }
      }
    } catch (error: any) {
      console.error('Error processing Google Sheets:', error);
      const errorData = error.response?.data;
      
      if (errorData) {
        const mainError = errorData.error || 'Failed to process Google Sheets';
        const allErrors = [mainError];
        
        // Add specific errors if available
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const displayErrors = errorData.errors.slice(0, 5);
          allErrors.push(...displayErrors);
          
          if (errorData.errors.length > 5) {
            allErrors.push(`... and ${errorData.errors.length - 5} more errors`);
          }
        }
        
        // Add flexible parser error if present
        if (errorData.flexibleError) {
          allErrors.push(`Flexible parser: ${errorData.flexibleError}`);
        }
        
        // Add service account email if access denied
        if (errorData.serviceAccountEmail) {
          allErrors.push(`Share your sheet with: ${errorData.serviceAccountEmail}`);
        }
        
        setErrors(allErrors);
        
        // Set warnings if any
        if (errorData.warnings && Array.isArray(errorData.warnings)) {
          setWarnings(errorData.warnings);
        }
      } else {
        setErrors(['Failed to process Google Sheets. Please check the URL and sharing permissions.']);
      }
    } finally {
      setIsProcessingSheets(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a snackbar notification here
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsLoading(true);
    setErrors([]);
    setWarnings([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Extract data
      const extractResponse = await axios.post(`${API_BASE_URL}/api/template/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (extractResponse.data.success) {
        setExtractedData(extractResponse.data.data);
        setValidation(extractResponse.data.validation);
        setWarnings(extractResponse.data.warnings || []);
        setActiveStep(1);

        // Automatically transform if extraction was successful
        const transformResponse = await axios.post(`${API_BASE_URL}/api/template/transform`, {
          extractedData: extractResponse.data.data
        });

        if (transformResponse.data.success) {
          setTransformedData(transformResponse.data.data);
          setMetrics(transformResponse.data.metrics);
          setActiveStep(2);
        }
      }
    } catch (error: any) {
      console.error('Error processing template:', error);
      const errorData = error.response?.data;
      
      if (errorData) {
        const mainError = errorData.error || 'Failed to process template';
        const allErrors = [mainError];
        
        // Add specific errors if available
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Only show first 5 errors to avoid overwhelming the user
          const displayErrors = errorData.errors.slice(0, 5);
          allErrors.push(...displayErrors);
          
          if (errorData.errors.length > 5) {
            allErrors.push(`... and ${errorData.errors.length - 5} more errors`);
          }
        }
        
        // Add flexible parser error if present
        if (errorData.flexibleError) {
          allErrors.push(`Flexible parser: ${errorData.flexibleError}`);
        }
        
        setErrors(allErrors);
        
        // Set warnings if any
        if (errorData.warnings && Array.isArray(errorData.warnings)) {
          setWarnings(errorData.warnings);
        }
      } else {
        setErrors(['Failed to process template. Please check the file format.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleExport = async (format: string) => {
    if (!transformedData) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/template/export/${format}`,
        { data: transformedData },
        { responseType: format === 'json' ? 'json' : 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `erc-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setErrors(['Failed to export data']);
    }
  };

  const handlePortalExport = async () => {
    if (!transformedData) return;

    console.log('Sending data to portal export:', transformedData);
    console.log('Data keys:', Object.keys(transformedData));
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/template/export/portal`,
        { data: transformedData },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const ein = transformedData.companyInfo?.ein?.replace(/-/g, '') || 'unknown';
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `ERC_Portal_Upload_${ein}_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Portal export error:', error);
      
      // If response is a blob (due to responseType: 'blob'), read it as text first
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.log('Error response text:', text);
          const errorData = JSON.parse(text);
          
          if (errorData?.missingFields) {
            setErrors([`Portal export failed - Missing fields: ${errorData.missingFields.join(', ')}`]);
          } else {
            setErrors([errorData.error || 'Failed to export portal format']);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          setErrors(['Failed to export portal format']);
        }
      } else {
        const errorData = error.response?.data;
        if (errorData?.missingFields) {
          setErrors([`Portal export failed - Missing fields: ${errorData.missingFields.join(', ')}`]);
        } else {
          setErrors(['Failed to export portal format']);
        }
      }
    }
  };

  const handleBulkUploadExport = async () => {
    if (!transformedData) return;

    console.log('Sending data to bulk upload export:', transformedData);
    console.log('Data keys:', Object.keys(transformedData));
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/template/export/bulk-upload`,
        { data: transformedData },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const ein = transformedData.companyInfo?.ein?.replace(/-/g, '') || 'unknown';
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `customer_bulk_upload_${ein}_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Bulk upload export error:', error);
      
      // If response is a blob (due to responseType: 'blob'), read it as text first
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.log('Error response text:', text);
          const errorData = JSON.parse(text);
          
          if (errorData?.missingFields) {
            setErrors([`Bulk upload export failed - Missing fields: ${errorData.missingFields.join(', ')}`]);
          } else {
            setErrors([errorData.error || 'Failed to export bulk upload format']);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          setErrors(['Failed to export bulk upload format']);
        }
      } else {
        const errorData = error.response?.data;
        if (errorData?.missingFields) {
          setErrors([`Bulk upload export failed - Missing fields: ${errorData.missingFields.join(', ')}`]);
        } else {
          setErrors(['Failed to export bulk upload format']);
        }
      }
    }
  };

  const handleUseSampleData = async () => {
    setIsLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      // Fetch sample data from backend
      const response = await axios.get(`${API_BASE_URL}/api/template/sample-data`);
      
      if (response.data.success) {
        setExtractedData(response.data.data);
        setTransformedData(response.data.data);
        setMetrics(response.data.metrics);
        setValidation(response.data.validation);
        setWarnings(response.data.warnings || []);
        setActiveStep(2); // Skip directly to Transform & Export step
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
      setErrors(['Failed to load sample data']);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUploadStep = () => (
    <Box>
      {/* Google Sheets URL Input Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ color: 'white' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description /> Import from Google Sheets (Recommended)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            Directly import your ERC template from Google Sheets without downloading
          </Typography>
          
          <Alert 
            severity="success" 
            sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          >
            <Typography variant="body2">
              <strong>✨ Works with any Google Sheet that has "Anyone with the link can view" permission!</strong>
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
              No sharing or authentication required for public sheets
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Google Sheets URL"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              disabled={isProcessingSheets}
              sx={{ 
                backgroundColor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: 'transparent' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Launch />
                  </InputAdornment>
                )
              }}
              helperText={
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Simply paste your Google Sheets URL and click Process
                </Typography>
              }
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSheetsUrlProcess}
              disabled={isProcessingSheets || !sheetsUrl.trim()}
              sx={{
                backgroundColor: 'white',
                color: '#667eea',
                minWidth: 120,
                height: 56,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              {isProcessingSheets ? <CircularProgress size={24} /> : 'Process'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }}>
        <Chip label="OR" />
      </Divider>

      {/* File Upload Section */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease'
        }}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop the Excel template here...'
                : 'Upload Excel File Directly'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag and drop your downloaded XLSX file, or click to select
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Expected template: "Its In The Box Logistics Inc" format
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Sheet name should be: "Understandable Data-final"
            </Typography>
          </>
        )}
      </Paper>
      
      <Divider sx={{ my: 3 }}>
        <Chip label="OR" />
      </Divider>
      
      {/* Sample Data Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Skip Upload & Use Sample Data
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Use pre-populated sample data to test the export functionality without uploading a file
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<Info />}
          onClick={handleUseSampleData}
          disabled={isLoading}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
          }}
        >
          Use Sample Data
        </Button>
      </Box>
    </Box>
  );

  const renderValidationStep = () => (
    <Box>
      {validation && (
        <Alert 
          severity={validation.isValid ? 'success' : 'warning'} 
          sx={{ mb: 2 }}
        >
          {validation.isValid 
            ? 'All required fields extracted successfully!'
            : `Found ${validation.missingFields.length} missing fields and ${validation.invalidFields.length} invalid fields`}
        </Alert>
      )}

      {warnings.length > 0 && (
        <Accordion defaultExpanded={warnings.includes('Used flexible parser due to non-standard template format')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography>Warnings ({warnings.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={warning}
                    secondary={
                      warning.includes('flexible parser') 
                        ? 'The file structure differs from the expected template. Data was extracted using pattern matching.'
                        : null
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {validation && validation.missingFields.length > 0 && (
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Error color="error" sx={{ mr: 1 }} />
            <Typography>Missing Fields ({validation.missingFields.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {validation.missingFields.map((field: string, index: number) => (
                <ListItem key={index}>
                  <ListItemText primary={field} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      <Button
        variant="contained"
        onClick={() => setActiveStep(2)}
        disabled={!extractedData}
        sx={{ mt: 2 }}
      >
        Continue to Transform
      </Button>
    </Box>
  );

  const renderTransformStep = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => handleExport('json')}
        >
          Export JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => handleExport('csv')}
        >
          Export CSV (All Data)
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => handleExport('xlsx')}
        >
          Export Excel (Single Tab)
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Transform />}
          onClick={handlePortalExport}
          sx={{ 
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)'
          }}
        >
          Export for Portal Upload (51 Fields)
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Transform />}
          onClick={handleBulkUploadExport}
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
          }}
        >
          Export Customer Bulk Upload (52 Fields)
        </Button>
      </Box>

      {/* All data in single scrollable view */}
      <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        {/* Company Information */}
        <Card sx={{ mb: 2 }}>
          <CardHeader title="Company Information" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 48%', minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">EIN</Typography>
                <Typography>{transformedData?.companyInfo?.ein || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 48%', minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Legal Name</Typography>
                <Typography>{transformedData?.companyInfo?.legalName || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 48%', minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Trade Name</Typography>
                <Typography>{transformedData?.companyInfo?.tradeName || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 48%', minWidth: 200 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography>
                  {transformedData?.companyInfo?.address ? 
                    `${transformedData.companyInfo.address.line1}, ${transformedData.companyInfo.address.city}, ${transformedData.companyInfo.address.state} ${transformedData.companyInfo.address.zip}` 
                    : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <Typography variant="body2" color="text.secondary">Filer Remarks</Typography>
                <Typography>{transformedData?.companyInfo?.filerRemarks || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 30%', minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">2019 Employees</Typography>
                <Typography>{transformedData?.companyInfo?.fullTimeW2Count2019 || 0}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 30%', minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">2020 Employees</Typography>
                <Typography>{transformedData?.companyInfo?.fullTimeW2Count2020 || 0}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 30%', minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">2021 Employees</Typography>
                <Typography>{transformedData?.companyInfo?.fullTimeW2Count2021 || 0}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Gross Receipts */}
        <Card sx={{ mb: 2 }}>
          <CardHeader title="Gross Receipts (Business Sales)" />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">Q1</TableCell>
                    <TableCell align="right">Q2</TableCell>
                    <TableCell align="right">Q3</TableCell>
                    <TableCell align="right">Q4</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transformedData?.grossReceipts && [2019, 2020, 2021].map(year => {
                    const yearData = transformedData.grossReceipts[year];
                    const total = yearData ? yearData.Q1 + yearData.Q2 + yearData.Q3 + yearData.Q4 : 0;
                    return (
                      <TableRow key={year}>
                        <TableCell>{year}</TableCell>
                        <TableCell align="right">${yearData?.Q1?.toLocaleString() || 0}</TableCell>
                        <TableCell align="right">${yearData?.Q2?.toLocaleString() || 0}</TableCell>
                        <TableCell align="right">${yearData?.Q3?.toLocaleString() || 0}</TableCell>
                        <TableCell align="right">${yearData?.Q4?.toLocaleString() || 0}</TableCell>
                        <TableCell align="right">${total.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* PPP Information */}
        {transformedData?.pppInformation && (
          <Card sx={{ mb: 2 }}>
            <CardHeader title="PPP Information" />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 48%', minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">PPP1 Forgiveness Amount</Typography>
                  <Typography>${transformedData.pppInformation.ppp1ForgivenessAmount?.toLocaleString() || 0}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 48%', minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">PPP2 Forgiveness Amount</Typography>
                  <Typography>${transformedData.pppInformation.ppp2ForgivenessAmount?.toLocaleString() || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* All Other Data */}
        {transformedData && (
          <>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Complete Extracted Data
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              All {Object.keys(transformedData).length} data sections have been extracted and are available for export.
              Use the export buttons above to download all data in your preferred format.
            </Alert>
          </>
        )}

        {/* Metrics if available */}
        {metrics && (
          <Card sx={{ mb: 2 }}>
            <CardHeader title="Calculated Metrics" />
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Average Employee Count: {metrics.averageEmployeeCount}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Total Retention Credit Wages: ${metrics.totalRetentionCreditWages?.toLocaleString()}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Eligible Quarters
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[2020, 2021].map(year =>
                  ['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
                    const isEligible = metrics.eligibleQuarters?.[year]?.[quarter];
                    return (
                      <Chip
                        key={`${year}-${quarter}`}
                        label={`${year} ${quarter}`}
                        color={isEligible ? 'success' : 'default'}
                        icon={isEligible ? <CheckCircle /> : undefined}
                      />
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        ERC Template Processor
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Extract and transform data from your Employee Retention Credit Excel templates
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {activeStep === 0 && renderUploadStep()}
      {activeStep === 1 && renderValidationStep()}
      {activeStep === 2 && renderTransformStep()}
      
      {activeStep === 2 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setActiveStep(0);
              setExtractedData(null);
              setTransformedData(null);
              setMetrics(null);
              setValidation(null);
              setWarnings([]);
              setErrors([]);
              setSheetsUrl('');
            }}
          >
            Start Over with New Data
          </Button>
        </Box>
      )}
    </Box>
  );
};