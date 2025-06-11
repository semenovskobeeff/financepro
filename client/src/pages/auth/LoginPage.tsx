import React, { useState } from 'react';
import { Container, Box, Typography, Button, Collapse } from '@mui/material';
import { BugReport } from '@mui/icons-material';
import LoginForm from '../../features/auth/components/LoginForm';
import AuthDiagnostics from '../../shared/ui/AuthDiagnostics';

const LoginPage: React.FC = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
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

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BugReport />}
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            sx={{ fontSize: '0.8rem' }}
          >
            {showDiagnostics ? 'Скрыть диагностику' : 'Проблемы со входом?'}
          </Button>
        </Box>
      </Container>

      <Collapse in={showDiagnostics} sx={{ width: '100%', maxWidth: 800 }}>
        <AuthDiagnostics />
      </Collapse>
    </Box>
  );
};

export default LoginPage;
