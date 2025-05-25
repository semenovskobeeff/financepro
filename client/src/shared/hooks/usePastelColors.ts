import { useTheme } from '@mui/material/styles';

/**
 * Хук для получения пастельных цветов из темы
 */
const usePastelColors = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return {
    // Группы цветов
    pink: theme.pastelColors.pink,
    blue: theme.pastelColors.blue,
    green: theme.pastelColors.green,
    purple: theme.pastelColors.purple,
    yellow: theme.pastelColors.yellow,
    coral: theme.pastelColors.coral,
    gray: theme.pastelColors.gray,

    // Статусы
    statusSuccess: theme.pastelColors.statusSuccess,
    statusProcessing: theme.pastelColors.statusProcessing,
    statusWarning: theme.pastelColors.statusWarning,
    statusError: theme.pastelColors.statusError,
    statusInfo: theme.pastelColors.statusInfo,
    statusBlocked: theme.pastelColors.statusBlocked,

    // Типы сущностей
    entityAccount: theme.pastelColors.entityAccount,
    entityCategory: theme.pastelColors.entityCategory,
    entityTransactionIncome: theme.pastelColors.entityTransactionIncome,
    entityTransactionExpense: theme.pastelColors.entityTransactionExpense,
    entityGoal: theme.pastelColors.entityGoal,
    entitySubscription: theme.pastelColors.entitySubscription,
    entityDebt: theme.pastelColors.entityDebt,

    // Вспомогательные функции
    getStatusColor: (status: string): string => {
      switch (status.toLowerCase()) {
        case 'active':
        case 'completed':
          return theme.pastelColors.statusSuccess;
        case 'in_progress':
        case 'processing':
          return theme.pastelColors.statusProcessing;
        case 'warning':
        case 'pending':
          return theme.pastelColors.statusWarning;
        case 'error':
        case 'failed':
          return theme.pastelColors.statusError;
        case 'info':
          return theme.pastelColors.statusInfo;
        case 'blocked':
          return theme.pastelColors.statusBlocked;
        default:
          return theme.pastelColors.statusInfo;
      }
    },

    getEntityColor: (entity: string): string => {
      switch (entity.toLowerCase()) {
        case 'account':
          return theme.pastelColors.entityAccount;
        case 'category':
          return theme.pastelColors.entityCategory;
        case 'income':
          return theme.pastelColors.entityTransactionIncome;
        case 'expense':
          return theme.pastelColors.entityTransactionExpense;
        case 'goal':
          return theme.pastelColors.entityGoal;
        case 'subscription':
          return theme.pastelColors.entitySubscription;
        case 'debt':
          return theme.pastelColors.entityDebt;
        default:
          return theme.pastelColors.gray[0];
      }
    },

    // Информация о текущей теме
    isDarkMode,
  };
};

export default usePastelColors;
