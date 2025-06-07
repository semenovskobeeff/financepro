import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Анимация для логотипа
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PreloaderContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'var(--bg-primary, #ffffff)',
  zIndex: 9999,
  animation: `${fadeIn} 0.3s ease-out`,
}));

const LogoContainer = styled(Box)({
  marginBottom: '2rem',
  animation: `${pulse} 2s ease-in-out infinite`,
});

const LoadingText = styled(Typography)({
  marginTop: '1.5rem',
  color: 'var(--text-secondary, #666)',
  fontSize: '1rem',
  fontWeight: 400,
});

const ProgressContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

interface PreloaderProps {
  message?: string;
}

const Preloader: React.FC<PreloaderProps> = ({
  message = 'Загружаем приложение...',
}) => {
  return (
    <PreloaderContainer>
      <LogoContainer>
        {/* Логотип приложения */}
        <div className="preloader-logo">₽</div>
      </LogoContainer>

      <ProgressContainer>
        <CircularProgress
          size={40}
          thickness={3}
          sx={{
            color: '#10b981',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </ProgressContainer>

      <div className="preloader-text">{message}</div>
    </PreloaderContainer>
  );
};

export default Preloader;
