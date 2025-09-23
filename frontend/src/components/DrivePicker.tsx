import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Checkbox,
  InputAdornment,
  Paper,
  Chip
} from '@mui/material';
import {
  Description,
  Search,
  Refresh,
  Close,
  CheckBox,
  CheckBoxOutlineBlank,
  FolderOpen
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
  shared: boolean;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

interface DrivePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (files: DriveFile[]) => void;
  accessToken: string | null;
  multiple?: boolean;
}

export const DrivePicker: React.FC<DrivePickerProps> = ({
  open,
  onClose,
  onSelect,
  accessToken,
  multiple = true
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && accessToken) {
      loadFiles();
    }
  }, [open, accessToken]);

  const loadFiles = async (pageToken?: string) => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/drive/files`, {
        params: {
          accessToken,
          searchQuery,
          pageToken
        }
      });

      if (pageToken) {
        setFiles(prev => [...prev, ...response.data.files]);
      } else {
        setFiles(response.data.files);
      }
      setNextPageToken(response.data.nextPageToken);
    } catch (error: any) {
      console.error('Error loading Drive files:', error);
      setError(error.response?.data?.error || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFiles([]);
    setSelectedFiles(new Set());
    loadFiles();
  };

  const handleToggleSelect = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      if (!multiple) {
        newSelected.clear();
      }
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleConfirm = () => {
    const selected = files.filter(f => selectedFiles.has(f.id));
    onSelect(selected);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Select Google Sheets from Drive</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Search sheets by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} disabled={loading}>
                    <Refresh />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}

        {multiple && files.length > 0 && (
          <Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
            <Button
              size="small"
              onClick={handleSelectAll}
              startIcon={selectedFiles.size === files.length ? <CheckBox /> : <CheckBoxOutlineBlank />}
            >
              {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Chip 
              label={`${selectedFiles.size} selected`} 
              color="primary" 
              size="small"
            />
          </Box>
        )}

        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading && files.length === 0 ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : files.length === 0 ? (
            <Box p={4} textAlign="center">
              <FolderOpen sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                {searchQuery ? 'No sheets found matching your search' : 'No Google Sheets found in your Drive'}
              </Typography>
            </Box>
          ) : (
            <List>
              {files.map((file) => (
                <ListItem 
                  key={file.id}
                  button
                  onClick={() => handleToggleSelect(file.id)}
                  selected={selectedFiles.has(file.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedFiles.has(file.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Modified: {formatDate(file.modifiedTime)}
                        </Typography>
                        {file.shared && (
                          <Chip label="Shared" size="small" sx={{ mt: 0.5 }} />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {nextPageToken && (
          <Box mt={2} textAlign="center">
            <Button
              onClick={() => loadFiles(nextPageToken)}
              disabled={loading}
              variant="outlined"
            >
              Load More
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedFiles.size === 0}
        >
          Select {selectedFiles.size > 0 && `(${selectedFiles.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};