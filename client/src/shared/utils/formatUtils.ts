/**
 * Безопасно форматирует число с фиксированным количеством знаков после запятой
 * @param value - значение для форматирования
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns отформатированная строка
 */
export const formatNumber = (
  value: number | string | undefined | null,
  decimals = 2
): string => {
  // Проверяем на undefined или null
  if (value === undefined || value === null) {
    return (0).toFixed(decimals);
  }

  const num = Number(value);

  // Проверяем на NaN или бесконечность
  if (isNaN(num) || !isFinite(num)) {
    return (0).toFixed(decimals);
  }

  return num.toFixed(decimals);
};

/**
 * Форматирует число с разделителями разрядов (точками)
 * @param value - значение для форматирования
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns отформатированная строка с точками как разделителями разрядов
 */
export const formatNumberWithDots = (
  value: number | string | undefined | null,
  decimals = 2
): string => {
  // Проверяем на undefined или null
  if (value === undefined || value === null) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }

  const num = Number(value);

  // Проверяем на NaN или бесконечность
  if (isNaN(num) || !isFinite(num)) {
    return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
  }

  // Форматируем число с точками как разделителями разрядов
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(num)
    .replace(/\s/g, '.');
};

/**
 * Форматирует валютную сумму
 * @param amount - сумма
 * @param currency - валюта (по умолчанию ₽)
 * @returns отформатированная строка с валютой
 */
export const formatCurrency = (
  amount: number | string | undefined | null,
  currency = '₽'
): string => {
  return `${formatNumber(amount)} ${currency}`;
};

/**
 * Форматирует валютную сумму с разделителями разрядов
 * @param amount - сумма
 * @param currency - валюта (по умолчанию ₽)
 * @returns отформатированная строка с валютой и точками как разделителями разрядов
 */
export const formatCurrencyWithDots = (
  amount: number | string | undefined | null,
  currency = '₽'
): string => {
  return `${formatNumberWithDots(amount)} ${currency}`;
};

/**
 * Форматирует сумму с префиксом знака для транзакций
 * @param amount - сумма
 * @param type - тип транзакции
 * @param currency - валюта
 * @returns отформатированная строка
 */
export const formatTransactionAmount = (
  amount: number | string | undefined | null,
  type: 'income' | 'expense' | 'transfer',
  currency = '₽'
): string => {
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';
  return `${prefix}${formatCurrency(amount, currency)}`;
};

/**
 * Форматирует сумму с префиксом знака для транзакций и разделителями разрядов
 * @param amount - сумма
 * @param type - тип транзакции
 * @param currency - валюта
 * @returns отформатированная строка
 */
export const formatTransactionAmountWithDots = (
  amount: number | string | undefined | null,
  type: 'income' | 'expense' | 'transfer',
  currency = '₽'
): string => {
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';
  return `${prefix}${formatCurrencyWithDots(amount, currency)}`;
};
