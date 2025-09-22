import React, { useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { PlayArrow, Download, ContentCopy, CheckCircle, Error, FileCopy, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ReadSheets } from './ReadSheets';
import { TemplateProcessor } from './TemplateProcessor';

interface ProcessResult {
  originalUrl: string;
  newUrl?: string;
  status: 'success' | 'error';
  error?: string;
}

interface ProcessSheetsProps {
  links: string[];
}

const API_BASE_URL = 'http://localhost:5000'; // Force correct port

export const ProcessSheets: React.FC<ProcessSheetsProps> = ({ links }) => {
  const { accessToken, refreshToken, serverAuthenticated, authMode } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<'copy' | 'read' | 'template'>('read'); // Default to read mode

  const processSheets = async () => {
    if (!serverAuthenticated && !accessToken) {
      alert('Please login first or configure server authentication');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/process/sheets`, {
        links,
        accessToken,
        refreshToken,
        useServerAuth: serverAuthenticated && !accessToken
      });

      setResults(response.data.results);
      setProgress(100);
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process sheets');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportResults = () => {
    const csvContent = [
      ['Original URL', 'New URL', 'Status', 'Error'],
      ...results.map(r => [
        r.originalUrl,
        r.newUrl || '',
        r.status,
        r.error || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed-sheets-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = results.length > 0 ? {
    total: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length
  } : null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Process Sheets
      </Typography>
      
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(e, newMode) => newMode && setMode(newMode)}
        sx={{ mb: 3 }}
        fullWidth
      >
        <ToggleButton value="read">
          <Visibility sx={{ mr: 1 }} />
          Read Data Only
        </ToggleButton>
        <ToggleButton value="copy">
          <FileCopy sx={{ mr: 1 }} />
          Copy & Set Permissions
        </ToggleButton>
        <ToggleButton value="template">
          <PlayArrow sx={{ mr: 1 }} />
          Process ERC Template
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === 'read' ? (
        <ReadSheets links={links} />
      ) : mode === 'template' ? (
        <TemplateProcessor />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" paragraph>
            The sheets will be copied and set to view-only access. Original sheets remain unchanged.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1">
              {links.length} Sheet{links.length !== 1 ? 's' : ''} to Process
            </Typography>
            <Box>
              {results.length > 0 && (
                <Button
                  startIcon={<Download />}
                  onClick={exportResults}
                  variant="outlined"
                  sx={{ mr: 2 }}
                >
                  Export Results
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={processSheets}
                disabled={isProcessing || links.length === 0}
              >
                {isProcessing ? 'Processing...' : 'Start Processing'}
              </Button>
            </Box>
          </Box>

          {isProcessing && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress variant="indeterminate" />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing sheets... This may take a few moments.
              </Typography>
            </Box>
          )}

          {summary && (
            <Alert 
              severity={summary.failed === 0 ? 'success' : 'warning'} 
              sx={{ mb: 3 }}
            >
              Processed {summary.total} sheets: {summary.successful} successful, {summary.failed} failed
            </Alert>
          )}

          {results.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Original URL</TableCell>
                    <TableCell>New URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 300 }}>
                          {result.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {result.newUrl ? (
                          <Typography noWrap sx={{ maxWidth: 300 }}>
                            {result.newUrl}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={result.status === 'success' ? <CheckCircle /> : <Error />}
                          label={result.status}
                          color={result.status === 'success' ? 'success' : 'error'}
                          size="small"
                        />
                        {result.error && (
                          <Tooltip title={result.error}>
                            <Typography variant="caption" display="block" color="error">
                              {result.error}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {result.newUrl && (
                          <Tooltip title={copiedIndex === index ? 'Copied!' : 'Copy URL'}>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(result.newUrl!, index)}
                            >
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};