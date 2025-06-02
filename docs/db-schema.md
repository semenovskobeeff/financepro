# Схема базы данных Finance App

## Общая информация

База данных: MongoDB
ORM: Mongoose

## Коллекции

### User

Пользователь приложения.

```javascript
{
  _id: ObjectId,
  email: String,         // Уникальный email
  password: String,      // Хешированный пароль
  name: String,          // Имя пользователя
  roles: [String],       // Роли пользователя ['user', 'admin']
  isActive: Boolean,     // Активен ли аккаунт
  settings: {
    primaryIncomeAccount: ObjectId,   // Основной счет для доходов
    primaryExpenseAccount: ObjectId   // Основной счет для расходов
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Account

Финансовый счет пользователя.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // Ссылка на пользователя
  type: String,         // Тип счета ['bank', 'deposit', 'goal', 'credit', 'subscription']
  name: String,         // Название счета
  cardInfo: String,     // Номер карты (опционально)
  balance: Number,      // Текущий баланс
  currency: String,     // Валюта (ISO код, по умолчанию 'RUB')
  status: String,       // Статус ['active', 'archived']
  history: [{           // История операций по счету
    id: ObjectId,         // ID операции
    operationType: String, // Тип операции ['income', 'expense', 'transfer']
    type: String,         // Дублирует operationType
    amount: Number,       // Сумма операции
    date: Date,           // Дата операции
    description: String,  // Описание
    linkedAccountId: ObjectId // ID связанного счета (для переводов)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Category

Категория транзакций.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,   // Ссылка на пользователя
  name: String,       // Название категории
  type: String,       // Тип категории ['income', 'expense']
  icon: String,       // Название иконки из Material Icons
  status: String,     // Статус ['active', 'archived']
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction

Финансовая транзакция.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // Ссылка на пользователя
  type: String,         // Тип транзакции ['income', 'expense', 'transfer']
  amount: Number,       // Сумма
  categoryId: ObjectId, // Ссылка на категорию (опционально)
  sourceId: ObjectId,   // ID источника (опционально)
  accountId: ObjectId,  // Счет, с которого производится операция
  toAccountId: ObjectId, // Целевой счет (для переводов)
  date: Date,           // Дата транзакции
  description: String,  // Описание
  status: String,       // Статус ['active', 'archived']
  createdAt: Date,
  updatedAt: Date
}
```

### Goal

Финансовая цель.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // Ссылка на пользователя
  name: String,         // Название цели
  accountId: ObjectId,  // Связанный счет
  targetAmount: Number, // Целевая сумма
  deadline: Date,       // Срок достижения цели
  progress: Number,     // Текущий прогресс (в валюте)
  transferHistory: [{   // История переводов в цель
    amount: Number,       // Сумма перевода
    date: Date,           // Дата перевода
    fromAccountId: ObjectId // Счет-источник
  }],
  status: String,       // Статус ['active', 'completed', 'cancelled', 'archived']
  createdAt: Date,
  updatedAt: Date
}
```

### Debt

Долг (кредит, займ, личный долг).

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // Ссылка на пользователя
  name: String,         // Название долга
  type: String,         // Тип долга ['credit', 'loan', 'creditCard', 'personalDebt']
  initialAmount: Number, // Первоначальная сумма долга
  currentAmount: Number, // Текущая оставшаяся сумма
  interestRate: Number, // Процентная ставка
  startDate: Date,      // Дата начала
  endDate: Date,        // Дата окончания
  nextPaymentDate: Date, // Дата следующего платежа
  nextPaymentAmount: Number, // Сумма следующего платежа
  lenderName: String,   // Имя кредитора/заемщика
  linkedAccountId: ObjectId, // Связанный счет
  paymentHistory: [{    // История платежей
    date: Date,           // Дата платежа
    amount: Number,       // Сумма платежа
    description: String   // Описание платежа
  }],
  paymentFrequency: String, // Частота платежей ['weekly', 'biweekly', 'monthly', 'quarterly', 'custom']
  status: String,       // Статус ['active', 'paid', 'defaulted', 'archived']
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription

Подписка или регулярный платеж.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // Ссылка на пользователя
  name: String,         // Название подписки/сервиса
  description: String,  // Описание подписки
  amount: Number,       // Сумма регулярного платежа
  currency: String,     // Валюта
  frequency: String,    // Частота ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']
  customFrequencyDays: Number, // Кастомная частота в днях
  startDate: Date,      // Дата начала подписки
  nextPaymentDate: Date, // Дата следующего платежа
  endDate: Date,        // Дата окончания (опционально)
  lastPaymentDate: Date, // Дата последнего платежа
  accountId: ObjectId,  // Связанный счет
  categoryId: ObjectId, // Категория расхода
  autoPayment: Boolean, // Автоматический платеж
  paymentHistory: [{    // История платежей
    id: ObjectId,         // ID платежа
    date: Date,           // Дата платежа
    amount: Number,       // Сумма платежа
    status: String,       // Статус ['success', 'pending', 'failed']
    description: String,  // Описание
    transactionId: ObjectId // Ссылка на транзакцию
  }],
  status: String,       // Статус ['active', 'paused', 'cancelled', 'archived']
  createdAt: Date,
  updatedAt: Date
}
```

## Отношения между коллекциями

### Основные связи (1:N)

1. User (1) -> Account (N)
2. User (1) -> Category (N)
3. User (1) -> Transaction (N)
4. User (1) -> Goal (N)
5. User (1) -> Debt (N)
6. User (1) -> Subscription (N)

### Операционные связи

7. Account (1) -> Transaction (N) через accountId
8. Account (1) -> Transaction (N) через toAccountId (для переводов)
9. Category (1) -> Transaction (N)
10. Account (1) -> Goal (1)
11. Account (1) -> Debt (N) через linkedAccountId
12. Account (1) -> Subscription (N)
13. Category (1) -> Subscription (N)

### Специальные связи

14. Transaction (1) -> SubscriptionHistoryItem (1) через transactionId
15. Account (N) -> Goal.transferHistory (N) через fromAccountId
16. User.settings -> Account через primaryIncomeAccount/primaryExpenseAccount

## Индексы для оптимизации

### User

- `email` (unique)

### Account

- `userId, status`
- `userId, type`

### Category

- `userId, status`
- `userId, type`

### Transaction

- `userId, date` (desc)
- `userId, accountId, date`
- `userId, categoryId, date`
- `userId, type, date`
- `status`

### Goal

- `userId, status`
- `userId, deadline`

### Debt

- `userId, status`
- `userId, nextPaymentDate`
- `linkedAccountId`

### Subscription

- `userId, status`
- `userId, nextPaymentDate`
- `accountId`
- `categoryId`
