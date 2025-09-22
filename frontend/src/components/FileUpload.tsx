import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import axios from 'axios';

interface FileUploadProps {
  onLinksExtracted: (links: string[]) => void;
}

const API_BASE_URL = 'http://localhost:5000'; // Force correct port

export const FileUpload: React.FC<FileUploadProps> = ({ onLinksExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Clear any previous errors
    setError(null);
    
    if (acceptedFiles.length === 0) {
      // File was rejected - error will be shown via fileRejections
      return;
    }

    const file = acceptedFiles[0];
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setExtractedLinks(response.data.links);
        onLinksExtracted(response.data.links);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  }, [onLinksExtracted]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.csv'],  // macOS reports CSV as text/plain
      'application/vnd.ms-excel': ['.xls', '.csv'],  // Windows may report CSV as this
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/octet-stream': ['.xlsx', '.xls', '.csv'],  // Fallback for unknown types
      'application/csv': ['.csv'],  // Some systems use this
      'application/x-csv': ['.csv']  // Alternative CSV MIME type
    },
    maxFiles: 1,
    disabled: isLoading,
    validator: (file) => {
      // Additional validation by extension
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!validExtensions.includes(ext)) {
        return {
          code: 'invalid-extension',
          message: `Invalid file type. Only CSV, XLSX, and XLS files are allowed.`
        };
      }
      return null;
    }
  });

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
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
                ? 'Drop the file here...'
                : 'Drag and drop a CSV or Excel file here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: CSV, XLSX, XLS
            </Typography>
          </>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {fileRejections.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            File rejected:
          </Typography>
          {fileRejections.map(({ file, errors }) => (
            <Box key={file.name}>
              <Typography variant="body2">
                {file.name} - {errors.map(e => e.message).join(', ')}
              </Typography>
            </Box>
          ))}
        </Alert>
      )}

      {extractedLinks.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Extracted Links
            <Chip
              label={`${extractedLinks.length} links found`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>
          <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
            <List>
              {extractedLinks.map((link, index) => (
                <ListItem key={index}>
                  <Description sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary={link}
                    primaryTypographyProps={{
                      noWrap: true,
                      sx: { overflow: 'hidden', textOverflow: 'ellipsis' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
};