# Тестирование API аналитики на продакшене

## Команды для проверки

### 1. Проверка дашборда аналитики

```bash
curl -X GET "https://your-api-domain.com/api/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Проверка аналитики транзакций

```bash
curl -X GET "https://your-api-domain.com/api/analytics/transactions?period=month" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Проверка логов на сервере

После запроса проверьте логи сервера на наличие:

```
🎯 [CONTROLLER] Запрос сводной аналитики от пользователя: [USER_ID]
🔍 [ANALYTICS] Получение сводной аналитики для пользователя: [USER_ID]
📊 [ANALYTICS] Найдено счетов: [COUNT]
💰 [ANALYTICS] Найдено транзакций за текущий месяц: [COUNT]
📈 [ANALYTICS] Статистика месяца: { income: X, expense: Y, balance: Z }
✅ [ANALYTICS] Итоговая аналитика дашборда: [DATA]
```

## Возможные проблемы и решения

### Проблема 1: Нет транзакций за текущий месяц

**Симптом**: `💰 [ANALYTICS] Найдено транзакций за текущий месяц: 0`
**Решение**: Система автоматически переключится на последние 30 дней

### Проблема 2: Неправильный userId

**Симптом**: `🎯 [CONTROLLER] Объект пользователя (_id): undefined`
**Решение**: Проверить JWT токен и аутентификацию

### Проблема 3: Нет данных в базе

**Симптом**: Все счетчики показывают 0
**Решение**: Проверить наличие данных для конкретного пользователя

## Команды для проверки данных в MongoDB

```javascript
// Подключиться к MongoDB и выполнить:

// Проверка пользователей
db.users.find().count();

// Проверка транзакций
db.transactions.find().count();

// Проверка транзакций конкретного пользователя
db.transactions.find({ userId: ObjectId('USER_ID_HERE') }).count();

// Проверка счетов
db.accounts.find({ userId: ObjectId('USER_ID_HERE') }).count();
```

## Ожидаемый результат после исправлений

После исправлений API должен возвращать:

```json
{
  "accounts": {
    "count": 3,
    "totalBalance": 558500
  },
  "monthStats": {
    "income": 435000,
    "expense": 400000,
    "balance": 35000
  },
  "subscriptions": {
    "count": 4,
    "monthlyAmount": 2500
  },
  "debts": {
    "count": 2,
    "totalAmount": 60000
  },
  "goals": {
    "count": 3,
    "totalTarget": 1500000,
    "totalProgress": 850000
  }
}
```
