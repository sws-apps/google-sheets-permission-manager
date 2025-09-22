import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';

export const AuthError: React.FC = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get('message') || 'Authentication failed';

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      <Alert severity="error" sx={{ mb: 3 }}>
        {errorMessage}
      </Alert>
      <Typography variant="h5" gutterBottom>
        Authentication Failed
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        There was an error during the authentication process.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </Box>
  );
};