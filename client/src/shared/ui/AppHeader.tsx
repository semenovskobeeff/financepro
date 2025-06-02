import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme as useMuiTheme,
  Box,
  styled,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/store';
import { useLogoutMutation } from 'features/auth/api/authApi';
import { logout } from 'features/auth/model/authSlice';
import NotificationButton from './NotificationButton';
import PaymentForm from '../../features/subscriptions/components/PaymentForm';
import { useMakePaymentMutation } from '../../entities/subscription/api/subscriptionApi';
import { Subscription } from '../../entities/subscription/model/types';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../config/ThemeContext';
import AddActionMenu from './AddActionMenu';
import AddFormModal from './AddFormModal';

// Стилизованные компоненты для шапки
const StyledAppBar = styled(AppBar)(({ theme }) => {
  const { themeMode } = useTheme();
  return {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    boxShadow: 'none',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    zIndex: 1000,
    transition: 'var(--transition-default)',
    height: '56px',
    display: 'flex',
    justifyContent: 'center',
  };
});

const StyledToolbar = styled(Toolbar)({
  minHeight: '56px !important',
  padding: '0 16px',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--icon-primary)',
  padding: 8,
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'var(--bg-accent)',
  },
  transition: 'var(--transition-default)',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--text-primary)',
  flexGrow: 0,
  marginRight: 20,
  transition: 'var(--transition-default)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 100,
}));

// Получение названия текущей страницы из пути
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Главная';
    case '/accounts':
      return 'Счета';
    case '/transactions':
      return 'Операции';
    case '/categories':
      return 'Категории';
    case '/goals':
      return 'Цели';
    case '/analytics':
      return 'Аналитика';
    case '/archive':
      return 'Архив';
    case '/settings':
      return 'Настройки';
    case '/profile':
      return 'Профиль';
    default:
      if (pathname.startsWith('/accounts/')) return 'Счет';
      if (pathname.startsWith('/goals/')) return 'Цель';
      if (pathname.startsWith('/debts/')) return 'Кредит';
      if (pathname.startsWith('/subscriptions/')) return 'Подписка';
      return 'Финансы PRO';
  }
};

const drawerWidth = 240;

const AppHeader: React.FC = () => {
  const theme = useMuiTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Состояние для формы платежа по подписке
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  // Состояние для меню добавления
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormType, setAddFormType] = useState<string | null>(null);
  const [addFormData, setAddFormData] = useState<any>(null);

  const [logoutMutation] = useLogoutMutation();
  const [makePayment] = useMakePaymentMutation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutMutation();
    dispatch(logout());
    handleUserMenuClose();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/profile');
  };

  // Обработчики для формы платежа
  const handlePaymentClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedSubscription(null);
  };

  const handleSubmitPayment = async (paymentData: any) => {
    if (!selectedSubscription) return;

    try {
      const response = await makePayment({
        id: selectedSubscription.id,
        data: paymentData,
      }).unwrap();

      return response;
    } catch (error) {
      console.error('Failed to make payment:', error);
      throw error;
    }
  };

  // Обработчики для меню добавления
  const handleAddButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleAddAction = (actionType: string, actionData?: any) => {
    setAddFormType(actionType);
    setAddFormData(actionData);
    setShowAddForm(true);
  };

  const handleAddFormClose = () => {
    setShowAddForm(false);
    setAddFormType(null);
    setAddFormData(null);
  };

  // Определение контента в зависимости от страницы
  const renderPageSpecificHeader = () => {
    return null;
  };

  return (
    <Box
      className="header"
      sx={{
        width: '100%',
        ml: 0,
      }}
    >
      <StyledAppBar position="sticky" elevation={0}>
        <StyledToolbar disableGutters>
          <Box
            sx={{ display: 'flex', alignItems: 'center', minWidth: '180px' }}
          >
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mr: 1 }}>
              <StyledIconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </StyledIconButton>
            </Box>

            <PageTitle variant="h6" noWrap>
              {getPageTitle(location.pathname)}
            </PageTitle>
          </Box>

          {renderPageSpecificHeader()}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: '180px',
              justifyContent: 'flex-end',
            }}
          >
            <Tooltip title="Добавить">
              <StyledIconButton
                aria-label="add new"
                onClick={handleAddButtonClick}
              >
                <AddIcon />
              </StyledIconButton>
            </Tooltip>

            <ThemeToggle />

            <NotificationButton onPaymentClick={handlePaymentClick} />

            {isAuthenticated ? (
              <>
                <Tooltip title="Аккаунт">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    aria-label="account"
                    sx={{
                      ml: 1,
                      p: 0.5,
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'var(--bg-accent)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: 'var(--text-accent)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {user?.name
                        ? user.name.substring(0, 1).toUpperCase()
                        : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                      mt: 1.5,
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      '& .MuiMenuItem-root': {
                        fontSize: 14,
                        padding: '8px 16px',
                        '&:hover': {
                          backgroundColor: 'var(--bg-accent)',
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleProfileClick}>
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    Профиль
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="inherit" />
                    </ListItemIcon>
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <StyledIconButton
                aria-label="login"
                edge="end"
                onClick={() => navigate('/login')}
              >
                <AccountCircleIcon />
              </StyledIconButton>
            )}
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      {selectedSubscription && (
        <PaymentForm
          subscription={selectedSubscription}
          open={Boolean(selectedSubscription)}
          onClose={handleClosePaymentForm}
          onSubmit={handleSubmitPayment}
        />
      )}

      {/* Меню добавления */}
      <AddActionMenu
        anchorEl={addMenuAnchorEl}
        open={Boolean(addMenuAnchorEl)}
        onClose={handleAddMenuClose}
        onAction={handleAddAction}
      />

      {/* Модальное окно с формами */}
      <AddFormModal
        type={addFormType}
        data={addFormData}
        open={showAddForm}
        onClose={handleAddFormClose}
      />
    </Box>
  );
};

export default AppHeader;
