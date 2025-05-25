import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme as useMuiTheme,
  styled,
  Divider,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Dashboard as DashboardIcon,
  Flag as FlagIcon,
  Analytics as AnalyticsIcon,
  Archive as ArchiveIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  Subscriptions as SubscriptionsIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from 'app/store';
import { useTheme } from '../config/ThemeContext';

const drawerWidth = 240;

// Стилизованные компоненты в стиле Notion
const NotionDrawer = styled(Drawer)(({ theme }) => {
  const { themeMode } = useTheme();
  return {
    '& .MuiDrawer-paper': {
      backgroundColor:
        themeMode === 'dark' ? '#191919' : 'var(--sidebar-color)',
      boxSizing: 'border-box',
      width: drawerWidth,
      height: '100%',
      borderRight: '1px solid var(--border-color)',
      boxShadow: 'none',
      transition:
        'background-color var(--transition-normal), border-color var(--transition-normal)',
    },
  };
});

const NotionListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginBottom: 2,
}));

const NotionListItemButton = styled(ListItemButton)<{
  selected?: boolean;
  component?: any;
  to?: string;
}>(({ selected }) => {
  const { themeMode } = useTheme();
  return {
    borderRadius: 'var(--border-radius-sm)',
    padding: '6px 8px',
    margin: '0 4px',
    fontSize: 'var(--font-size-sm)',
    color:
      themeMode === 'dark' && selected
        ? '#ffffff'
        : selected
        ? 'var(--text-color)'
        : 'var(--text-color-light)',
    backgroundColor: selected ? 'var(--hover-color)' : 'transparent',
    fontWeight: selected ? 500 : 400,
    '&:hover': {
      backgroundColor: 'var(--hover-color)',
    },
    transition: 'all var(--transition-normal)',
  };
});

const NotionListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 26,
  color: 'inherit',
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
}));

const NotionListItemText = styled(ListItemText)(({ theme }) => ({
  margin: 0,
  '& .MuiListItemText-primary': {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'inherit',
    transition: 'color var(--transition-normal)',
  },
}));

const NotionDivider = styled(Divider)(({ theme }) => ({
  margin: '12px 8px',
  borderColor: 'var(--border-color)',
  transition: 'border-color var(--transition-normal)',
}));

const AppTitle = styled(Typography)(({ theme }) => {
  const { themeMode } = useTheme();
  return {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: themeMode === 'dark' ? '#ffffff' : 'var(--text-color)',
    transition: 'color var(--transition-normal)',
  };
});

const NavToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '56px !important',
  padding: '14px 14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  borderBottom: '1px solid var(--border-color)',
  transition: 'border-color var(--transition-normal)',
}));

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactElement;
  requireAuth: boolean;
}

// Настройка пунктов навигации
const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Главная',
    icon: <DashboardIcon />,
    requireAuth: true,
  },
  {
    path: '/accounts',
    label: 'Счета',
    icon: <AccountBalanceIcon />,
    requireAuth: true,
  },
  {
    path: '/transactions',
    label: 'Операции',
    icon: <PaymentIcon />,
    requireAuth: true,
  },
  {
    path: '/categories',
    label: 'Категории',
    icon: <CategoryIcon />,
    requireAuth: true,
  },
  {
    path: '/goals',
    label: 'Цели',
    icon: <FlagIcon />,
    requireAuth: true,
  },
  {
    path: '/debts',
    label: 'Долги и кредиты',
    icon: <CreditCardIcon />,
    requireAuth: true,
  },
  {
    path: '/subscriptions',
    label: 'Подписки',
    icon: <SubscriptionsIcon />,
    requireAuth: true,
  },
  {
    path: '/analytics',
    label: 'Аналитика',
    icon: <AnalyticsIcon />,
    requireAuth: true,
  },
  {
    path: '/archive',
    label: 'Архив',
    icon: <ArchiveIcon />,
    requireAuth: true,
  },
  {
    path: '/settings',
    label: 'Настройки',
    icon: <SettingsIcon />,
    requireAuth: true,
  },
];

const Navbar: React.FC = () => {
  const theme = useMuiTheme();
  const { themeMode } = useTheme();
  const location = useLocation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <NavToolbar>
        <AppTitle variant="h6" noWrap>
          Финансы PRO
        </AppTitle>
      </NavToolbar>

      <List
        className="sidebar"
        sx={{
          flexGrow: 1,
          padding: '8px',
          backgroundColor:
            themeMode === 'dark' ? '#191919' : 'var(--sidebar-color)',
          transition: 'background-color var(--transition-normal)',
        }}
      >
        {navItems
          .filter(item => !item.requireAuth || isAuthenticated)
          .map((item, index) => (
            <React.Fragment key={item.path}>
              <NotionListItem disablePadding>
                <NotionListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'none',
                    },
                  }}
                  className={
                    isActive(item.path) ? 'sidebar-item active' : 'sidebar-item'
                  }
                >
                  <NotionListItemIcon>{item.icon}</NotionListItemIcon>
                  <NotionListItemText primary={item.label} />
                </NotionListItemButton>
              </NotionListItem>
            </React.Fragment>
          ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        height: '100%',
        position: 'absolute',
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            height: '100%',
            backgroundColor:
              themeMode === 'dark' ? '#191919' : 'var(--sidebar-color)',
            borderRight: '1px solid var(--border-color)',
            transition:
              'background-color var(--transition-normal), border-color var(--transition-normal)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <NotionDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
        open
      >
        {drawer}
      </NotionDrawer>
    </Box>
  );
};

export default Navbar;
