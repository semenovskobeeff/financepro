import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import LoginForm from '../../features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Финансы PRO
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Управляйте своими финансами эффективно
          </Typography>
        </Box>
        <LoginForm />
      </Container>
    </Box>
  );
};

export default LoginPage;
