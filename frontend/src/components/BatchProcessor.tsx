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
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Link,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CloudUpload,
  Download,
  PlayArrow,
  Stop,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Info,
  Description,
  GetApp
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

interface BatchSession {
  sessionId: string;
  status: 'idle' | 'processing' | 'completed' | 'cancelled';
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  startTime?: string;
  endTime?: string;
  percentComplete: number;
}

interface BatchRow {
  rowIndex: number;
  url: string;
  metadata: any;
}

interface ProcessingReport {
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  successRate: number;
  averageProcessingTime: number;
  errors: Array<{
    rowIndex: number;
    url: string;
    error: string;
  }>;
}

export const BatchProcessor: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<BatchSession | null>(null);
  const [uploadedRows, setUploadedRows] = useState<BatchRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingReport, setProcessingReport] = useState<ProcessingReport | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [statusInterval, setStatusInterval] = useState<NodeJS.Timeout | null>(null);
  const [removeLinks, setRemoveLinks] = useState(false);

  const steps = ['Upload Batch File', 'Review & Process', 'Download Results'];

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);

  // Poll for status updates when processing
  useEffect(() => {
    if (isProcessing && sessionId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/batch/status/${sessionId}`);
          if (response.data.success) {
            setSession(response.data.session);
            
            // Check if processing is complete
            if (response.data.session.status === 'completed' || response.data.session.status === 'cancelled') {
              setIsProcessing(false);
              clearInterval(interval);
              
              if (response.data.result) {
                setProcessingReport(response.data.result.report);
                setActiveStep(2);
              }
            }
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 1000); // Poll every second
      
      setStatusInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing, sessionId]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setErrors([]);
    setWarnings([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/batch/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setUploadedRows(response.data.rows);
        setWarnings(response.data.warnings || []);
        setActiveStep(1);
      }
    } catch (error: any) {
      console.error('Error uploading batch file:', error);
      const errorData = error.response?.data;
      if (errorData) {
        setErrors([errorData.error || 'Failed to upload batch file']);
        if (errorData.warnings) {
          setWarnings(errorData.warnings);
        }
      } else {
        setErrors(['Failed to upload batch file']);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isUploading || isProcessing
  });

  const handleStartProcessing = async () => {
    if (!sessionId) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/batch/process/${sessionId}`,
        { removeLinks },  // Send removeLinks in request body
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data.success) {
        // Processing started successfully
        console.log('Batch processing started');
      }
    } catch (error: any) {
      console.error('Error starting batch processing:', error);
      setIsProcessing(false);
      const errorData = error.response?.data;
      setErrors([errorData?.error || 'Failed to start batch processing']);
    }
  };

  const handleCancelProcessing = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${API_BASE_URL}/api/batch/cancel/${sessionId}`);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error cancelling batch processing:', error);
    }
  };

  const handleDownloadResults = async () => {
    if (!sessionId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/batch/download/${sessionId}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `bulk_upload_batch_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading results:', error);
      setErrors(['Failed to download results']);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/batch/template`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'batch_input_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const renderUploadStep = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Upload a CSV or Excel file containing Google Sheets URLs and metadata.
          Each row should have a Google Sheets URL and optional contact information.
        </Typography>
        <Button
          size="small"
          startIcon={<GetApp />}
          onClick={handleDownloadTemplate}
          sx={{ mt: 1 }}
        >
          Download Template
        </Button>
      </Alert>

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
        {isUploading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop the batch file here...'
                : 'Drag and drop your batch CSV/Excel file, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: CSV, XLSX
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              File should contain: google_sheets_url, contact_first_name, contact_last_name, email, phone, etc.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Batch Summary"
          subheader={`${uploadedRows.length} Google Sheets URLs detected`}
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Total URLs to Process
              </Typography>
              <Typography variant="h4">
                {uploadedRows.length}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Estimated Processing Time
              </Typography>
              <Typography variant="h4">
                {Math.ceil(uploadedRows.length * 2 / 60)} min
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>Google Sheets URL</TableCell>
              <TableCell>Contact Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedRows.map((row) => (
              <TableRow key={row.rowIndex}>
                <TableCell>{row.rowIndex}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ 
                    maxWidth: 300, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {row.url}
                  </Typography>
                </TableCell>
                <TableCell>
                  {row.metadata.contact_first_name} {row.metadata.contact_last_name}
                </TableCell>
                <TableCell>{row.metadata.email}</TableCell>
                <TableCell>{row.metadata.main_phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {session && isProcessing && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Processing Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={session.percentComplete} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="h6" color="success.main">
                  {session.completedJobs}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
                <Typography variant="h6" color="error.main">
                  {session.failedJobs}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6">
                  {session.totalJobs - session.completedJobs - session.failedJobs}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Toggle for removing links */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={removeLinks}
              onChange={(e) => setRemoveLinks(e.target.checked)}
              disabled={isProcessing}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography>Remove all links from output</Typography>
              <Typography variant="caption" color="text.secondary">
                Clears Column AR (form941x_files) and all URL fields when enabled
              </Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {!isProcessing ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStartProcessing}
            disabled={uploadedRows.length === 0}
          >
            Start Processing
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<Stop />}
            onClick={handleCancelProcessing}
          >
            Stop Processing
          </Button>
        )}
      </Box>
    </Box>
  );

  const renderResultsStep = () => (
    <Box>
      {processingReport && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Processing Complete"
              avatar={
                processingReport.successRate >= 80 ? 
                  <CheckCircle color="success" /> : 
                  <Warning color="warning" />
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 22%', minWidth: 150 }}>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="h4" color={
                    processingReport.successRate >= 80 ? 'success.main' : 'warning.main'
                  }>
                    {processingReport.successRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 22%', minWidth: 150 }}>
                  <Typography variant="body2" color="text.secondary">
                    Successful Rows
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {processingReport.successfulRows}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 22%', minWidth: 150 }}>
                  <Typography variant="body2" color="text.secondary">
                    Failed Rows
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {processingReport.failedRows}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 22%', minWidth: 150 }}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Processing Time
                  </Typography>
                  <Typography variant="h4">
                    {(processingReport.averageProcessingTime / 1000).toFixed(1)}s
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {processingReport.errors.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Processing Errors" />
              <CardContent>
                <List dense>
                  {processingReport.errors.slice(0, 10).map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Row ${error.rowIndex}: ${error.error}`}
                        secondary={error.url}
                      />
                    </ListItem>
                  ))}
                  {processingReport.errors.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${processingReport.errors.length - 10} more errors`}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Download />}
              onClick={handleDownloadResults}
              disabled={processingReport.successfulRows === 0}
            >
              Download Results CSV ({processingReport.successfulRows} rows)
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setActiveStep(0);
                setSessionId(null);
                setSession(null);
                setUploadedRows([]);
                setProcessingReport(null);
                setErrors([]);
                setWarnings([]);
              }}
            >
              Process Another Batch
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Batch Google Sheets Processor
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Process multiple Google Sheets URLs at once with metadata override
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

      {warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warnings.map((warning, index) => (
            <div key={index}>{warning}</div>
          ))}
        </Alert>
      )}

      {activeStep === 0 && renderUploadStep()}
      {activeStep === 1 && renderReviewStep()}
      {activeStep === 2 && renderResultsStep()}
    </Box>
  );
};