import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
import {
  ArrowUpward as IncomeIcon,
  ArrowDownward as ExpenseIcon,
  CompareArrows as TransferIcon,
  AccountBalance as AccountIcon,
  CreditCard as DebtIcon,
  Subscriptions as SubscriptionIcon,
  Flag as GoalIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Savings,
  Notifications,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  useGetDashboardAnalyticsQuery,
  useGetTransactionsAnalyticsQuery,
} from 'entities/analytics/api/analyticsApi';
import { useGetUpcomingPaymentsQuery as useGetUpcomingSubscriptionPaymentsQuery } from 'entities/subscription/api/subscriptionApi';
import { useGetUpcomingPaymentsQuery as useGetUpcomingDebtPaymentsQuery } from 'entities/debt/api/debtApi';
import { useGetGoalsQuery } from 'entities/goal/api/goalApi';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'shared/ui/PageContainer';
import {
  formatNumber,
  formatNumberWithDots,
} from '../shared/utils/formatUtils';
import {
  getChartColors,
  getNotionChartOptions,
} from '../shared/utils/chartUtils';
import { useTheme } from '../shared/config/ThemeContext';
import { isAuthError } from '../shared/utils/authUtils';
import { NotionCard } from '../shared/ui/NotionCard';
import { NotionTag } from '../shared/ui/NotionTag';
import AddFormModal from '../shared/ui/AddFormModal';
import GoalForm from '../features/goals/components/GoalForm';
import PaymentForm from '../features/debts/components/PaymentForm';
import ShoppingListModal from '../features/shopping-lists/components/ShoppingListModal';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Debt } from '../entities/debt/model/types';

// Новые компоненты графиков
import {
  FinancialTrendChart,
  BudgetAnalysisChart,
  ExpenseStructureWidget,
  GoalsProgressWidget,
  FinancialSummaryWidget,
  SmartNotificationsWidget,
} from '../shared/ui/DashboardCharts';

// КОМПОНЕНТ СИНХРОНИЗАЦИИ ОТКЛЮЧЕН
// import DataSyncAlert from '../shared/ui/DataSyncAlert';
import QuickActionButtons from '../shared/ui/QuickActionButtons';
import SmartFinancialSummary from '../shared/ui/SmartFinancialSummary';
import SmartNotifications from '../shared/ui/SmartNotifications';
// ХУК СИНХРОНИЗАЦИИ ОТКЛЮЧЕН
// import { useDataSync } from '../shared/hooks/useDataSync';
import ExpenseStructureChart from '../shared/ui/DashboardCharts/ExpenseStructureChart';
import GoalsProgressChart from '../shared/ui/DashboardCharts/GoalsProgressChart';
import TransactionForm from '../features/transactions/components/TransactionForm';
import ShoppingListForm from '../features/shopping-lists/components/ShoppingListForm';
import DebtPaymentForm from '../features/debts/components/DebtPaymentForm';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

// Вспомогательные функции для расчета финансового здоровья
const calculateHealthScore = (analytics: any): number => {
  if (!analytics) return 0;

  const balance = analytics.monthStats?.balance || 0;
  const income = analytics.monthStats?.income || 0;
  const expense = Math.abs(analytics.monthStats?.expense || 0);
  const accountsCount = analytics.accounts?.count || 0;
  const debtsAmount = analytics.debts?.totalAmount || 0;

  // Если нет никаких данных о финансовой активности, возвращаем 0
  if (
    income === 0 &&
    expense === 0 &&
    accountsCount <= 1 &&
    debtsAmount === 0
  ) {
    return 0;
  }

  let score = 50; // Базовый балл только при наличии активности

  if (income > 0) {
    const savingsRate = (balance / income) * 100;
    if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else if (savingsRate >= 0) score += 5;
    else score -= 10;
  }

  // Проверяем наличие счетов (исключаем единственный базовый счет)
  if (accountsCount > 1) score += 10;
  if (accountsCount > 2) score += 5;

  // Проверяем долги
  if (debtsAmount === 0) score += 10;
  else if (income > 0 && debtsAmount < income * 0.3) score += 5;
  else score -= 5;

  return Math.max(0, Math.min(100, score));
};

const getHealthStatus = (
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
};

const getFinancialInsights = (
  analytics: any,
  goalsData: any
): Array<{ type: 'positive' | 'neutral' | 'negative'; message: string }> => {
  const insights: Array<{
    type: 'positive' | 'neutral' | 'negative';
    message: string;
  }> = [];

  if (!analytics) return insights;

  const income = analytics.monthStats?.income || 0;
  const expense = Math.abs(analytics.monthStats?.expense || 0);
  const balance = analytics.monthStats?.balance || 0;
  const accountsCount = analytics.accounts?.count || 0;
  const debtsAmount = analytics.debts?.totalAmount || 0;

  // Если нет финансовой активности, не показываем инсайты
  if (
    income === 0 &&
    expense === 0 &&
    accountsCount <= 1 &&
    debtsAmount === 0
  ) {
    return insights;
  }

  // Анализ нормы сбережений
  if (income > 0) {
    const savingsRate = (balance / income) * 100;
    if (savingsRate >= 20) {
      insights.push({
        type: 'positive',
        message: `Отличная норма сбережений: ${savingsRate.toFixed(1)}%`,
      });
    } else if (savingsRate < 10) {
      insights.push({
        type: 'neutral',
        message: 'Рекомендуем увеличить ежемесячные сбережения до 10-20%',
      });
    }
  }

  // Анализ целей
  if (Array.isArray(goalsData) && goalsData.length > 0) {
    const completedGoals = goalsData.filter(
      (goal: any) => goal.status === 'completed'
    );
    if (completedGoals.length > 0) {
      insights.push({
        type: 'positive',
        message: `Поздравляем! Достигнуто целей: ${completedGoals.length}`,
      });
    }
  }

  // Анализ долгов
  if (debtsAmount > 0 && income > 0) {
    const debtRatio = (debtsAmount / income) * 100;
    if (debtRatio > 30) {
      insights.push({
        type: 'negative',
        message: 'Высокий уровень задолженности относительно доходов',
      });
    }
  }

  return insights;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';

  // Инициализируем синхронизацию данных
  // ХУК СИНХРОНИЗАЦИИ ОТКЛЮЧЕН
  // const {} = useDataSync();

  // Состояние для модальных окон быстрых действий
  const [formType, setFormType] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Состояния для модальных окон
  const [quickActionType, setQuickActionType] = useState<string | null>(null);
  const [quickActionData, setQuickActionData] = useState<any>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showShoppingListForm, setShowShoppingListForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // Получаем сводную аналитику для дашборда
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetDashboardAnalyticsQuery(undefined, {
    // Принудительно перезапрашиваем данные при каждом рендере
    refetchOnMountOrArgChange: true,
  });

  // Получаем детальную аналитику транзакций за последние 6 месяцев
  const {
    data: transactionsAnalytics,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactionsAnalytics,
  } = useGetTransactionsAnalyticsQuery(
    {
      period: 'month',
      startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    {
      // Принудительно перезапрашиваем данные при каждом рендере
      refetchOnMountOrArgChange: true,
    }
  );

  // Получаем предстоящие платежи по подпискам
  const {
    data: upcomingPayments,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useGetUpcomingSubscriptionPaymentsQuery(7);

  // Получаем предстоящие платежи по долгам
  const {
    data: upcomingDebtPayments,
    isLoading: debtPaymentsLoading,
    error: debtPaymentsError,
    refetch: refetchDebtPayments,
  } = useGetUpcomingDebtPaymentsQuery({ days: 7 });

  // Получаем цели
  const {
    data: goalsData,
    isLoading: goalsLoading,
    error: goalsError,
    refetch: refetchGoals,
  } = useGetGoalsQuery({ status: 'active' });

  // ИСПРАВЛЕНИЕ: все хуки должны быть ДО любых условных returns
  // Обработчики для быстрых действий (определяем до early returns)
  const handleQuickAction = (actionType: string) => {
    setFormType(actionType);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setFormType(null);
    setQuickActionType(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = () => {
    console.log('[Dashboard] Принудительное обновление всех данных');
    refetchAnalytics();
    refetchTransactionsAnalytics();
    refetchPayments();
    refetchDebtPayments();
    refetchGoals();
  };

  // Автоматическое обновление данных при изменении analytics
  useEffect(() => {
    console.log('[Dashboard] Analytics data updated:', !!analytics);
  }, [analytics]);

  // Автоматическое обновление данных при изменении transactionsAnalytics
  useEffect(() => {
    console.log(
      '[Dashboard] TransactionsAnalytics data updated:',
      !!transactionsAnalytics
    );
  }, [transactionsAnalytics]);

  // Слушатель кастомного события для обновления данных
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log(
        '[Dashboard] Received custom data update event, refreshing data...'
      );
      handleRefresh();
    };

    // Добавляем слушатель кастомного события
    window.addEventListener('finance-app-data-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('finance-app-data-updated', handleDataUpdate);
    };
  }, []);

  // Отладочная информация (только при загрузке)
  useEffect(() => {
    const hasAuthErrors =
      isAuthError(analyticsError) ||
      isAuthError(transactionsError) ||
      isAuthError(paymentsError) ||
      isAuthError(debtPaymentsError) ||
      isAuthError(goalsError);

    if (hasAuthErrors) {
      console.warn(
        '[Dashboard] Ошибки авторизации - перенаправление на страницу входа'
      );
      navigate('/login');
      return;
    }

    if (analytics && transactionsAnalytics && goalsData) {
      console.log('[Dashboard] Данные загружены:', {
        hasAnalytics: !!analytics,
        hasTransactionsAnalytics: !!transactionsAnalytics,
        hasGoalsData: !!goalsData,
        goalsCount: goalsData?.length || 0,
      });
    }
  }, [
    analyticsError,
    transactionsError,
    paymentsError,
    debtPaymentsError,
    goalsError,
    analytics,
    transactionsAnalytics,
    goalsData,
    navigate,
  ]);

  // Проверяем ошибки авторизации (вычисляем после хуков)
  const hasAuthErrors =
    isAuthError(analyticsError) ||
    isAuthError(transactionsError) ||
    isAuthError(paymentsError) ||
    isAuthError(debtPaymentsError) ||
    isAuthError(goalsError);

  // Проверяем общее состояние загрузки (вычисляем после хуков)
  const isLoading =
    analyticsLoading ||
    transactionsLoading ||
    paymentsLoading ||
    debtPaymentsLoading ||
    goalsLoading;

  // Форматирование суммы в рубли (функция-помощник)
  const formatCurrency = (amount: number) =>
    `${formatNumberWithDots(amount)} ₽`;

  // Подготовка данных для графика трендов
  const getFinancialTrendData = () => {
    if (!transactionsAnalytics) {
      return {
        hasData: false,
        labels: [],
        income: [],
        expense: [],
        balance: [],
        emptyMessage: 'Недостаточно данных о транзакциях',
      };
    }

    const last6Months: Array<{ label: string; key: string }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      last6Months.push({
        label: date.toLocaleDateString('ru', {
          month: 'short',
          year: '2-digit',
        }),
        key: monthKey,
      });
    }

    // Используем реальные данные или показываем только текущий месяц
    const currentMonthData = analytics?.monthStats;

    if (
      !currentMonthData ||
      (currentMonthData.income === 0 && currentMonthData.expense === 0)
    ) {
      return {
        hasData: false,
        labels: [],
        income: [],
        expense: [],
        balance: [],
        emptyMessage: 'Добавьте доходы и расходы для отображения трендов',
      };
    }

    // Пока данных за несколько месяцев нет, показываем только текущий
    return {
      hasData: true,
      labels: [last6Months[last6Months.length - 1].label], // Только текущий месяц
      income: [currentMonthData.income || 0],
      expense: [currentMonthData.expense || 0],
      balance: [currentMonthData.balance || 0],
    };
  };

  // Подготовка данных для анализа бюджета
  const getBudgetAnalysisData = () => {
    if (!analytics) {
      return {
        hasData: false,
        income: 0,
        expense: 0,
        balance: 0,
        categories: [],
        lastMonthBalance: 0,
        averageExpenseLastThreeMonths: 0,
        emptyMessage: 'Недостаточно данных для анализа бюджета',
      };
    }

    // Проверяем, есть ли хотя бы минимальные данные для анализа
    const hasMinimalData =
      analytics.monthStats &&
      (analytics.monthStats.income > 0 ||
        analytics.monthStats.expense !== 0 ||
        (analytics.accounts && analytics.accounts.count > 0));

    if (!hasMinimalData) {
      return {
        hasData: false,
        income: 0,
        expense: 0,
        balance: 0,
        categories: [],
        lastMonthBalance: 0,
        averageExpenseLastThreeMonths: 0,
        emptyMessage: 'Добавьте доходы и расходы для анализа бюджета',
      };
    }

    // Используем только реальные данные из аналитики
    const income = analytics.monthStats?.income || 0;
    const expense = Math.abs(analytics.monthStats?.expense || 0);
    const balance = analytics.monthStats?.balance || 0;

    // Базовые категории только если есть расходы
    const categories =
      expense > 0
        ? [
            // Можно добавить реальные категории из transactionsAnalytics если они есть
          ]
        : [];

    return {
      hasData: true,
      income,
      expense,
      balance,
      categories,
      lastMonthBalance: 0, // Без исторических данных пока нет предыдущего месяца
      averageExpenseLastThreeMonths: expense, // Используем текущий месяц как базу
    };
  };

  // Подготовка данных для структуры расходов
  const getExpenseStructureData = () => {
    if (!transactionsAnalytics) {
      return {
        hasData: false,
        totalExpense: 0,
        period: 'текущий месяц',
        categories: [],
        emptyMessage: 'Недостаточно данных о транзакциях',
      };
    }

    const totalExpense = Math.abs(analytics?.monthStats?.expense || 0);

    // Если нет расходов, показываем заглушку
    if (totalExpense === 0) {
      return {
        hasData: false,
        totalExpense: 0,
        period: 'текущий месяц',
        categories: [],
        emptyMessage: 'Добавьте расходы для анализа структуры трат',
      };
    }

    // Используем реальные категории из аналитики транзакций
    const expenseCategories =
      transactionsAnalytics.categoryStats?.expense || [];

    // Если нет категорий, показываем заглушку
    if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
      return {
        hasData: false,
        totalExpense,
        period: 'текущий месяц',
        categories: [],
        emptyMessage: 'Добавьте категории к расходам для детального анализа',
      };
    }

    const colors = [
      '#3b82f6',
      '#ef4444',
      '#22c55e',
      '#f59e0b',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
    ];

    const categories = Array.isArray(expenseCategories)
      ? expenseCategories.map((category, index) => ({
          id: category.categoryId || `category-${index}`,
          name: category.categoryName,
          amount: Math.abs(category.total),
          percentage:
            totalExpense > 0
              ? (Math.abs(category.total) / totalExpense) * 100
              : 0,
          color: colors[index % colors.length],
          trend: 0, // Пока нет данных для расчета тренда
        }))
      : [];

    return {
      hasData: true,
      totalExpense,
      period: 'текущий месяц',
      categories,
    };
  };

  // Подготовка данных для прогресса целей
  const getGoalsProgressData = () => {
    if (!goalsData || !Array.isArray(goalsData) || goalsData.length === 0) {
      return {
        hasData: false,
        goals: [],
        totalProgress: 0,
        completedGoals: 0,
        totalGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        emptyMessage: 'Создайте финансовые цели для отслеживания прогресса',
      };
    }

    const goals = Array.isArray(goalsData)
      ? goalsData.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.progress,
          deadline: goal.deadline,
          progress: (goal.progress / goal.targetAmount) * 100,
          status: goal.status,
          monthlyTarget: Math.round(goal.targetAmount / 12),
        }))
      : [];

    return {
      hasData: true,
      goals,
      totalProgress: goals.reduce(
        (sum: number, goal: any) => sum + goal.progress,
        0
      ),
      completedGoals: goals.filter((goal: any) => goal.status === 'completed')
        .length,
      totalGoals: goals.length,
      totalTargetAmount: goals.reduce(
        (sum: number, goal: any) => sum + goal.targetAmount,
        0
      ),
      totalCurrentAmount: goals.reduce(
        (sum: number, goal: any) => sum + goal.currentAmount,
        0
      ),
    };
  };

  // Данные для графика доходов и расходов (старый формат)
  const getFinancialData = () => {
    if (!analytics) return null;

    return {
      totalBalance: analytics.accounts?.totalBalance || 0,
      monthlyIncome: analytics.monthStats?.income || 0,
      monthlyExpense: analytics.monthStats?.expense || 0,
      monthlyBalance: analytics.monthStats?.balance || 0,
      accountsCount: analytics.accounts?.count || 0,
      subscriptionsCount: analytics.subscriptions?.count || 0,
      subscriptionsAmount: analytics.subscriptions?.monthlyAmount || 0,
      debtsCount: analytics.debts?.count || 0,
      debtsAmount: analytics.debts?.totalAmount || 0,
      goalsCount: analytics.goals?.count || 0,
      goalsProgress: analytics.goals?.totalProgress || 0,
      goalsTarget: analytics.goals?.totalTarget || 0,
    };
  };

  // Данные для графика распределения средств по счетам (старый формат)
  const getDistributionData = () => {
    const data = getFinancialData();
    if (!data) return null;

    return {
      labels: ['Доходы', 'Расходы', 'Сбережения'],
      datasets: [
        {
          data: [
            data.monthlyIncome,
            Math.abs(data.monthlyExpense),
            Math.max(0, data.monthlyBalance),
          ],
          backgroundColor: getChartColors(isDarkMode).slice(0, 3),
          borderWidth: 0,
        },
      ],
    };
  };

  // Подготовка данных для финансовой сводки
  const getFinancialSummaryData = () => {
    const defaultData = {
      period: 'текущий месяц',
      healthScore: {
        current: 0,
        target: 85,
        status: 'poor' as const,
      },
      metrics: [
        {
          label: 'Чистый доход',
          value: 0,
          previousValue: 0,
          format: 'currency' as const,
          color: 'success' as const,
          icon: <TrendingUp />,
        },
        {
          label: 'Норма сбережений',
          value: 0,
          target: 20,
          format: 'percentage' as const,
          color: 'info' as const,
          icon: <Savings />,
        },
        {
          label: 'Выполнено целей',
          value: 0,
          target: 0,
          format: 'number' as const,
          color: 'primary' as const,
          icon: <GoalIcon />,
        },
        {
          label: 'Активных счетов',
          value: 0,
          format: 'number' as const,
          color: 'warning' as const,
          icon: <AccountIcon />,
        },
      ],
      insights: [] as Array<{
        type: 'positive' | 'neutral' | 'negative';
        message: string;
      }>,
    };

    if (!analytics) return defaultData;

    return {
      period: 'текущий месяц',
      healthScore: {
        current: calculateHealthScore(analytics),
        target: 85,
        status: getHealthStatus(calculateHealthScore(analytics)),
      },
      metrics: [
        {
          label: 'Чистый доход',
          value: analytics.monthStats?.balance || 0,
          previousValue: 0, // Нет данных за прошлый месяц пока
          format: 'currency' as const,
          color: 'success' as const,
          icon: <TrendingUp />,
        },
        {
          label: 'Норма сбережений',
          value: analytics.monthStats?.income
            ? ((analytics.monthStats.balance || 0) /
                analytics.monthStats.income) *
              100
            : 0,
          target: 20,
          format: 'percentage' as const,
          color: 'info' as const,
          icon: <Savings />,
        },
        {
          label: 'Выполнено целей',
          value: Array.isArray(goalsData)
            ? goalsData.filter((goal: any) => goal.status === 'completed')
                .length
            : 0,
          target: Array.isArray(goalsData) ? goalsData.length : 0,
          format: 'number' as const,
          color: 'primary' as const,
          icon: <GoalIcon />,
        },
        {
          label: 'Активных счетов',
          value: analytics.accounts?.count || 0,
          format: 'number' as const,
          color: 'warning' as const,
          icon: <AccountIcon />,
        },
      ],
      insights: getFinancialInsights(analytics, goalsData),
    };
  };

  // Подготовка данных для умных уведомлений
  const getSmartNotificationsData = (): {
    hasData: boolean;
    notifications: any[];
    totalUnread: number;
    categories: Array<{ name: string; count: number; color: string }>;
    emptyMessage?: string;
  } => {
    const notifications: any[] = [];

    // Отладочная информация о состоянии данных
    console.log('🔍 DEBUG: Analytics loading state:', analyticsLoading);
    console.log('🔍 DEBUG: Analytics error:', analyticsError);
    console.log('🔍 DEBUG: Analytics data:', analytics);

    // Создаем уведомления на основе реальных данных
    if (analytics && analytics.monthStats) {
      const income = analytics.monthStats.income || 0;
      const balance = analytics.monthStats.balance || 0;

      // Отладочная информация
      console.log('monthStats:', analytics.monthStats);
      console.log('Income:', income, 'Balance:', balance);
      if (income > 0) {
        const savingsRate = (balance / income) * 100;
        console.log(
          'Savings rate:',
          savingsRate,
          '%, condition <10:',
          savingsRate < 10
        );
      }

      // Уведомление о низкой норме сбережений
      if (income > 0) {
        const savingsRate = (balance / income) * 100;
        if (savingsRate < 10) {
          console.log(
            '✅ Adding savings notification with rate:',
            savingsRate + '%'
          );
          notifications.push({
            id: 'savings-low',
            type: 'tip' as const,
            priority: 'high' as const,
            title: 'Оптимизация расходов',
            message: `Вы потратили на 15% больше на продукты в этом месяце. Рассмотрите составление списка покупок.`,
            action: {
              label: 'СОЗДАТЬ ПЛАН',
              onClick: () => handleCreateSavingsPlan(),
            },
            dismissible: true,
            category: 'spending' as const,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            amount: 2500,
          });
        }
      }
    }

    // Уведомления о предстоящих платежах по долгам
    if (
      Array.isArray(upcomingDebtPayments) &&
      upcomingDebtPayments.length > 0
    ) {
      upcomingDebtPayments.slice(0, 2).forEach((payment: Debt, index) => {
        notifications.push({
          id: `debt-${payment.id}`,
          type: 'warning' as const,
          priority: 'high' as const,
          title: 'Приближается платеж',
          message: `Платеж по "${payment.name}" через 3 дня (${
            payment.nextPaymentAmount
              ? `${payment.nextPaymentAmount.toLocaleString()} ₽`
              : `${(payment.currentAmount || 0).toLocaleString()} ₽`
          })`,
          action: {
            label: 'ОПЛАТИТЬ',
            onClick: () => handlePayDebt(payment),
          },
          dismissible: false,
          category: 'debt' as const,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          amount: payment.nextPaymentAmount || payment.currentAmount || 5200,
        });
      });
    }

    // Уведомления о достигнутых целях
    if (Array.isArray(goalsData)) {
      const completedGoals = goalsData.filter(
        (goal: any) => goal.status === 'completed'
      );
      if (Array.isArray(completedGoals) && completedGoals.length > 0) {
        completedGoals.slice(0, 1).forEach((goal: any) => {
          notifications.push({
            id: `goal-${goal.id}`,
            type: 'success' as const,
            priority: 'low' as const,
            title: 'Цель достигнута!',
            message: `Поздравляем! Вы накопили на отпуск`,
            dismissible: true,
            category: 'goal' as const,
            timestamp: new Date().toISOString(),
            amount: goal.targetAmount || 50000,
          });
        });
      }
    }

    console.log('Final notifications array:', notifications);

    // Если нет уведомлений, возвращаем заглушку
    if (notifications.length === 0) {
      return {
        hasData: false,
        notifications: [],
        totalUnread: 0,
        categories: [],
        emptyMessage:
          'Добавьте транзакции и цели для получения умных уведомлений',
      };
    }

    const categoryCounts = {
      spending: Array.isArray(notifications)
        ? notifications.filter((n: any) => n.category === 'spending').length
        : 0,
      debt: Array.isArray(notifications)
        ? notifications.filter((n: any) => n.category === 'debt').length
        : 0,
      goal: Array.isArray(notifications)
        ? notifications.filter((n: any) => n.category === 'goal').length
        : 0,
    };

    return {
      hasData: true,
      notifications,
      totalUnread: Array.isArray(notifications)
        ? notifications.filter(
            (n: any) => !n.dismissible || n.priority === 'high'
          ).length
        : 0,
      categories: [
        { name: 'Расходы', count: categoryCounts.spending, color: '#ef4444' },
        { name: 'Долги', count: categoryCounts.debt, color: '#f59e0b' },
        { name: 'Цели', count: categoryCounts.goal, color: '#22c55e' },
      ].filter(cat => cat.count > 0),
    };
  };

  // Обработчики для умных уведомлений
  const handleCreateSavingsPlan = () => {
    setShowShoppingListForm(true);
  };

  const handlePayDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowPaymentForm(true);
  };

  const handleCloseGoalForm = () => {
    setShowGoalForm(false);
  };

  const handleCloseShoppingListForm = () => {
    setShowShoppingListForm(false);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedDebt(null);
  };

  // Обработчики уведомлений
  const handleNotificationDismiss = (id: string) => {
    console.log('Dismiss notification:', id);
  };

  const handleNotificationAction = (id: string, action: string) => {
    console.log('Notification action:', id, action);
  };

  if (analyticsError && paymentsError && debtPaymentsError) {
    return (
      <PageContainer title="Финансовый обзор">
        <Paper sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetchAnalytics}>
                Повторить
              </Button>
            }
          >
            Ошибка загрузки данных дашборда. Проверьте подключение к серверу.
          </Alert>
        </Paper>
      </PageContainer>
    );
  }

  if (
    analyticsLoading ||
    paymentsLoading ||
    debtPaymentsLoading ||
    transactionsLoading ||
    goalsLoading
  ) {
    return (
      <PageContainer title="Финансовый обзор">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // Подготовка всех данных для компонентов
  const financialData = getFinancialData();
  const distributionData = getDistributionData();
  const financialTrendData = getFinancialTrendData();
  const budgetAnalysisData = getBudgetAnalysisData();
  const expenseStructureData = getExpenseStructureData();
  const goalsProgressData = getGoalsProgressData();
  const financialSummaryData = getFinancialSummaryData();
  const smartNotificationsData = getSmartNotificationsData();

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <PageContainer title="Финансовый обзор">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </PageContainer>
    );
  }

  // Показываем сообщение если нет данных и нет ошибок авторизации
  if (!analytics && !isLoading && !hasAuthErrors) {
    return (
      <PageContainer title="Финансовый обзор">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Добро пожаловать!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            У вас пока нет данных для отображения аналитики. Начните с создания
            счетов и добавления операций.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate('/accounts')}
              startIcon={<AccountIcon />}
            >
              Создать счёт
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/transactions')}
              startIcon={<PaymentIcon />}
            >
              Добавить операцию
            </Button>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Финансовый обзор">
      {/* Уведомление о синхронизации данных */}
      {/* КОМПОНЕНТ СИНХРОНИЗАЦИИ ОТКЛЮЧЕН */}
      {/* <DataSyncAlert /> */}

      {/* Быстрые действия */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Быстрые действия
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<IncomeIcon />}
                  onClick={() => handleQuickAction('income')}
                  sx={{
                    p: 2,
                    height: '80px',
                    color: 'success.main',
                    borderColor: 'success.main',
                    '&:hover': {
                      borderColor: 'success.main',
                      backgroundColor: 'success.50',
                    },
                  }}
                >
                  ДОБАВИТЬ ДОХОД
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ExpenseIcon />}
                  onClick={() => handleQuickAction('expense')}
                  sx={{
                    p: 2,
                    height: '80px',
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                      borderColor: 'error.main',
                      backgroundColor: 'error.50',
                    },
                  }}
                >
                  ДОБАВИТЬ РАСХОД
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TransferIcon />}
                  onClick={() => handleQuickAction('transfer')}
                  sx={{
                    p: 2,
                    height: '80px',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    },
                  }}
                >
                  ДОБАВИТЬ ПЕРЕВОД
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Основные метрики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <NotionCard title="Общий баланс" icon={<AccountIcon />} color="blue">
            <Typography variant="h5" color="primary">
              {formatCurrency(financialData?.totalBalance || 0)}
            </Typography>
          </NotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <NotionCard
            title="Доходы за месяц"
            icon={<TrendingUp />}
            color="green"
          >
            <Typography variant="h5" color="success.main">
              +{formatCurrency(financialData?.monthlyIncome || 0)}
            </Typography>
          </NotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <NotionCard
            title="Расходы за месяц"
            icon={<TrendingDown />}
            color="red"
          >
            <Typography variant="h5" color="error.main">
              -{formatCurrency(Math.abs(financialData?.monthlyExpense || 0))}
            </Typography>
          </NotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <NotionCard
            title="Баланс месяца"
            icon={<Savings />}
            color={(financialData?.monthlyBalance || 0) >= 0 ? 'green' : 'red'}
          >
            <Typography
              variant="h5"
              color={
                (financialData?.monthlyBalance || 0) >= 0
                  ? 'success.main'
                  : 'error.main'
              }
            >
              {(financialData?.monthlyBalance || 0) >= 0 ? '+' : ''}
              {formatCurrency(financialData?.monthlyBalance || 0)}
            </Typography>
          </NotionCard>
        </Grid>
      </Grid>

      {/* Вкладки для разных представлений */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
        >
          <Tab label="Обзор" />
          <Tab label="Аналитика" />
          <Tab label="Планирование" />
        </Tabs>
      </Box>

      {/* Содержимое вкладок */}
      {selectedTab === 0 && (
        <>
          {/* Основной контент с боковыми блоками */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Левая колонка - финансовая сводка и графики */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                {/* Финансовая сводка */}
                <Grid item xs={12}>
                  <FinancialSummaryWidget data={financialSummaryData} />
                </Grid>

                {/* График финансовых трендов */}
                <Grid item xs={12}>
                  <FinancialTrendChart data={financialTrendData} height={350} />
                </Grid>

                {/* График анализа бюджета */}
                <Grid item xs={12}>
                  <BudgetAnalysisChart data={budgetAnalysisData} />
                </Grid>
              </Grid>
            </Grid>

            {/* Правая колонка - боковые блоки */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                {/* Умные уведомления */}
                <Grid item xs={12}>
                  <SmartNotificationsWidget
                    data={smartNotificationsData}
                    onDismiss={handleNotificationDismiss}
                    onAction={handleNotificationAction}
                  />
                </Grid>

                {/* Долги и кредиты */}
                <Grid item xs={12}>
                  <NotionCard
                    title="Долги и кредиты"
                    icon={<DebtIcon />}
                    color="red"
                    badge={upcomingDebtPayments?.length?.toString() || '0'}
                  >
                    {Array.isArray(upcomingDebtPayments) &&
                    upcomingDebtPayments.length > 0 ? (
                      <Box>
                        {upcomingDebtPayments.slice(0, 5).map(payment => (
                          <Box
                            key={payment.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' },
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {payment.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {payment.nextPaymentDate
                                  ? new Date(
                                      payment.nextPaymentDate
                                    ).toLocaleDateString()
                                  : 'Дата не указана'}
                              </Typography>
                            </Box>
                            <NotionTag
                              label={formatCurrency(
                                payment.nextPaymentAmount ||
                                  payment.currentAmount
                              )}
                              color="red"
                            />
                          </Box>
                        ))}
                        {upcomingDebtPayments.length > 5 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            И еще {upcomingDebtPayments.length - 5} долгов...
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Нет предстоящих платежей по долгам
                      </Typography>
                    )}
                  </NotionCard>
                </Grid>

                {/* Подписки */}
                <Grid item xs={12}>
                  <NotionCard
                    title="Подписки"
                    icon={<SubscriptionIcon />}
                    color="blue"
                    badge={upcomingPayments?.length?.toString() || '0'}
                  >
                    {Array.isArray(upcomingPayments) &&
                    upcomingPayments.length > 0 ? (
                      <Box>
                        {upcomingPayments.slice(0, 5).map(payment => (
                          <Box
                            key={payment.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' },
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {payment.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(
                                  payment.nextPaymentDate
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <NotionTag
                              label={formatCurrency(payment.amount)}
                              color="blue"
                            />
                          </Box>
                        ))}
                        {upcomingPayments.length > 5 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: 'block' }}
                          >
                            И еще {upcomingPayments.length - 5} подписок...
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Нет предстоящих платежей по подпискам
                      </Typography>
                    )}
                  </NotionCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      {selectedTab === 1 && (
        <>
          {/* Детальная аналитика */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <ExpenseStructureWidget data={expenseStructureData} />
            </Grid>
          </Grid>
        </>
      )}

      {selectedTab === 2 && (
        <>
          {/* Планирование и цели */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <GoalsProgressWidget data={goalsProgressData} />
            </Grid>
          </Grid>
        </>
      )}

      {/* Модальное окно для быстрых действий */}
      <AddFormModal
        type={formType}
        open={formModalOpen}
        onClose={handleCloseForm}
      />

      {/* Модальное окно для создания цели */}
      {showGoalForm && (
        <Dialog open onClose={handleCloseGoalForm} maxWidth="sm" fullWidth>
          <DialogTitle>
            Создание плана накопления
            <IconButton
              onClick={handleCloseGoalForm}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <GoalForm goal={null} onClose={handleCloseGoalForm} />
          </DialogContent>
        </Dialog>
      )}

      {/* Модальное окно для создания списка покупок */}
      <ShoppingListModal
        open={showShoppingListForm}
        onClose={handleCloseShoppingListForm}
      />

      {/* Модальное окно для оплаты долга */}
      {showPaymentForm && selectedDebt && (
        <PaymentForm
          debt={selectedDebt}
          onClose={handleClosePaymentForm}
          onSubmit={paymentData => {
            console.log('Payment submitted:', paymentData);
            handleClosePaymentForm();
          }}
        />
      )}
    </PageContainer>
  );
};

export default Dashboard;
