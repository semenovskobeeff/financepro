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
  const num = Number(value || 0);
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toFixed(decimals);
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
