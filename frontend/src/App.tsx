import React, { useState } from 'react';
import {
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert
} from '@mui/material';
import { Google, Logout, Lock, LockOpen } from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FileUpload } from './components/FileUpload';
import { ProcessSheets } from './components/ProcessSheets';
import { TemplateProcessor } from './components/TemplateProcessor';
import { BatchProcessor } from './components/BatchProcessor';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  const { isAuthenticated, serverAuthenticated, authMode, login, logout, accessToken, serverAccountInfo } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [mode, setMode] = useState<'sheets' | 'erc'>('erc');
  const [ercSubMode, setErcSubMode] = useState<'single' | 'batch'>('single');

  // Dynamic steps based on auth mode
  const steps = serverAuthenticated 
    ? ['Upload Spreadsheet', 'Process Sheets']
    : ['Sign in with Google', 'Upload Spreadsheet', 'Process Sheets'];

  React.useEffect(() => {
    if (serverAuthenticated) {
      setActiveStep(0); // Start at upload step
    } else if (isAuthenticated) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [isAuthenticated, serverAuthenticated]);

  const handleLinksExtracted = (links: string[]) => {
    setExtractedLinks(links);
    if (links.length > 0) {
      setActiveStep(serverAuthenticated ? 1 : 2);
    }
  };

  const getAuthStatusChip = () => {
    if (serverAuthenticated && accessToken) {
      return <Chip icon={<Lock />} label="User + Server Auth" color="success" size="small" />;
    } else if (serverAuthenticated) {
      return <Chip icon={<LockOpen />} label="Server Auth" color="info" size="small" />;
    } else if (accessToken) {
      return <Chip icon={<Lock />} label="User Auth" color="primary" size="small" />;
    }
    return null;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {mode === 'sheets' ? 'Google Sheets Permission Manager' : 'ERC Template Processor'}
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setMode(mode === 'sheets' ? 'erc' : 'sheets')}
            sx={{ mr: 2 }}
          >
            Switch to {mode === 'sheets' ? 'ERC Processor' : 'Sheets Manager'}
          </Button>
          {mode === 'sheets' && getAuthStatusChip()}
          {mode === 'sheets' && accessToken ? (
            <Button color="inherit" onClick={logout} startIcon={<Logout />} sx={{ ml: 2 }}>
              Logout
            </Button>
          ) : mode === 'sheets' && !serverAuthenticated ? (
            <Button color="inherit" onClick={login} startIcon={<Google />} sx={{ ml: 2 }}>
              Sign in with Google
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {mode === 'erc' ? (
          <>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  ERC Template Processing Mode
                </Typography>
                <Button
                  variant={ercSubMode === 'single' ? 'contained' : 'outlined'}
                  onClick={() => setErcSubMode('single')}
                  size="small"
                >
                  Single Sheet
                </Button>
                <Button
                  variant={ercSubMode === 'batch' ? 'contained' : 'outlined'}
                  onClick={() => setErcSubMode('batch')}
                  size="small"
                >
                  Batch Processing
                </Button>
              </Box>
            </Paper>
            {ercSubMode === 'single' ? (
              <TemplateProcessor />
            ) : (
              <BatchProcessor />
            )}
          </>
        ) : (
          <>
            {serverAuthenticated && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Server authentication is enabled. You can process sheets without logging in!
                  {serverAccountInfo && (
                    <>
                      <br />
                      Using Google account: <strong>{serverAccountInfo.email}</strong>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Note: Only sheets accessible to this account can be processed.
                      </Typography>
                    </>
                  )}
                </Typography>
              </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {!isAuthenticated && !serverAuthenticated ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  Welcome to Google Sheets Permission Manager
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  This tool helps you bulk copy Google Sheets and set them to view-only access.
                  To get started, please sign in with your Google account.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={login}
                  startIcon={<Google />}
                  sx={{ mt: 2 }}
                >
                  Sign in with Google
                </Button>
              </Paper>
            ) : (activeStep === 0 && serverAuthenticated) || (activeStep === 1 && !serverAuthenticated) ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Upload Your Spreadsheet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload a CSV or Excel file containing Google Sheets URLs. The tool will extract
                  all valid Google Sheets links from your file.
                </Typography>
                <FileUpload onLinksExtracted={handleLinksExtracted} />
              </Paper>
            ) : (activeStep === 1 && serverAuthenticated) || (activeStep === 2 && !serverAuthenticated) ? (
              <Paper sx={{ p: 3 }}>
                <ProcessSheets links={extractedLinks} />
                <Button
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setActiveStep(serverAuthenticated ? 0 : 1);
                    setExtractedLinks([]);
                  }}
                >
                  Upload Another File
                </Button>
              </Paper>
            ) : null}
          </>
        )}
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;