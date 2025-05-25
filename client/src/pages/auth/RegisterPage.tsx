import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import RegisterForm from '../../features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Финансы PRO
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Создайте аккаунт для управления финансами
        </Typography>
      </Box>
      <RegisterForm />
    </Container>
  );
};

export default RegisterPage;
