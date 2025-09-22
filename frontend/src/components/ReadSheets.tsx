import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  ExpandMore,
  CheckCircle,
  Error,
  ContentCopy,
  Download
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ReadSheetsProps {
  links: string[];
}

interface SheetData {
  originalUrl: string;
  sheetId: string;
  sheetName?: string;
  status: 'success' | 'error';
  error?: string;
  data?: {
    range: string;
    values: any[][];
  }[];
}

const API_BASE_URL = 'http://localhost:5000';

export const ReadSheets: React.FC<ReadSheetsProps> = ({ links }) => {
  const { accessToken, refreshToken, serverAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SheetData[]>([]);
  const [rangeInput, setRangeInput] = useState('A1:Z100');
  const [selectedData, setSelectedData] = useState<string>('');

  const handleReadSheets = async () => {
    setIsProcessing(true);
    setResults([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/sheets/read-sheets`, {
        links,
        ranges: rangeInput.split(',').map(r => r.trim()),
        accessToken,
        refreshToken,
        useServerAuth: serverAuthenticated
      });

      setResults(response.data.results);
    } catch (error) {
      console.error('Error reading sheets:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToCSV = (sheetData: SheetData) => {
    if (!sheetData.data || sheetData.data.length === 0) return;
    
    // Combine all ranges into one CSV
    let csvContent = '';
    sheetData.data.forEach((range, index) => {
      if (index > 0) csvContent += '\n\n';
      csvContent += `Range: ${range.range}\n`;
      csvContent += range.values.map(row => row.join(',')).join('\n');
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetData.sheetName || 'sheet-data'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderCellData = (values: any[][]) => {
    if (!values || values.length === 0) {
      return <Typography variant="body2" color="text.secondary">No data found</Typography>;
    }

    // If it's a small dataset, show as table
    if (values.length <= 10 && values[0]?.length <= 10) {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              {values.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} sx={{ border: '1px solid #ddd' }}>
                      {cell || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // For larger datasets, show summary and raw data
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {values.length} rows × {values[0]?.length || 0} columns
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 1, 
            maxHeight: 300, 
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}
        >
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </Paper>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Read Sheet Data
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Extract data from your Google Sheets without making copies.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Cell Ranges"
          value={rangeInput}
          onChange={(e) => setRangeInput(e.target.value)}
          placeholder="e.g., A1:Z100, Sheet2!B1:D50"
          helperText="Comma-separated ranges. Use sheet name prefix for specific sheets."
          sx={{ mb: 2 }}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleReadSheets}
        disabled={isProcessing || links.length === 0}
        startIcon={isProcessing ? <CircularProgress size={20} /> : <PlayArrow />}
        fullWidth
        sx={{ mb: 3 }}
      >
        {isProcessing ? 'Reading Sheets...' : `Read Data from ${links.length} Sheet${links.length !== 1 ? 's' : ''}`}
      </Button>

      {results.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Results
            </Typography>
            <Chip
              label={`${results.filter(r => r.status === 'success').length}/${results.length} successful`}
              color={results.every(r => r.status === 'success') ? 'success' : 'warning'}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>

          {results.map((result, index) => (
            <Accordion key={index} defaultExpanded={result.status === 'success'}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  {result.status === 'success' ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Error color="error" />
                  )}
                  <Typography sx={{ flexGrow: 1 }} noWrap>
                    {result.sheetName || result.sheetId}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {result.status === 'error' ? (
                  <Alert severity="error">{result.error}</Alert>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Sheet ID: {result.sheetId}
                      </Typography>
                      {result.data && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => exportToCSV(result)}
                        >
                          Export as CSV
                        </Button>
                      )}
                    </Box>
                    {result.data?.map((rangeData, rangeIndex) => (
                      <Box key={rangeIndex} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">
                            Range: {rangeData.range}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(JSON.stringify(rangeData.values))}
                            sx={{ ml: 1 }}
                          >
                            <Tooltip title="Copy data">
                              <ContentCopy fontSize="small" />
                            </Tooltip>
                          </IconButton>
                        </Box>
                        {renderCellData(rangeData.values)}
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};