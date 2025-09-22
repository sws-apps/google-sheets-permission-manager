import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1000);
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Authentication successful! Redirecting...
      </Typography>
    </Box>
  );
};