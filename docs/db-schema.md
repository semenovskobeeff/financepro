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
  history: [{            // История операций по счету
    operationType: String,  // Тип операции ['income', 'expense', 'transfer']
    amount: Number,         // Сумма операции
    date: Date,             // Дата операции
    description: String,    // Описание
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
  description: String,  // Описание
  targetAmount: Number, // Целевая сумма
  currentAmount: Number, // Текущая накопленная сумма
  currency: String,     // Валюта
  deadline: Date,       // Срок достижения цели
  accountId: ObjectId,  // Связанный счет
  status: String,       // Статус ['active', 'archived', 'completed']
  createdAt: Date,
  updatedAt: Date
}
```

### Debt

Долг (выданный или полученный).

```javascript
{
  _id: ObjectId,
  userId: ObjectId,     // Ссылка на пользователя
  type: String,         // Тип долга ['given', 'received']
  amount: Number,       // Сумма долга
  remainingAmount: Number, // Оставшаяся сумма
  currency: String,     // Валюта
  personName: String,   // Имя человека
  description: String,  // Описание
  dueDate: Date,        // Срок возврата
  accountId: ObjectId,  // Связанный счет
  status: String,       // Статус ['active', 'archived', 'paid']
  payments: [{           // История платежей
    amount: Number,       // Сумма платежа
    date: Date,           // Дата платежа
    transactionId: ObjectId // Ссылка на транзакцию
  }],
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
  amount: Number,       // Сумма регулярного платежа
  currency: String,     // Валюта
  frequency: String,    // Частота ['monthly', 'quarterly', 'yearly']
  billDate: Number,     // День месяца для регулярного списания
  categoryId: ObjectId, // Категория расхода
  accountId: ObjectId,  // Связанный счет
  notificationDays: Number, // За сколько дней уведомлять о платеже
  status: String,       // Статус ['active', 'archived']
  paymentHistory: [{     // История платежей
    date: Date,           // Дата платежа
    amount: Number,       // Сумма платежа
    transactionId: ObjectId // Ссылка на транзакцию
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Отношения между коллекциями

1. User (1) -> Account (N)
2. User (1) -> Category (N)
3. User (1) -> Transaction (N)
4. User (1) -> Goal (N)
5. User (1) -> Debt (N)
6. User (1) -> Subscription (N)
7. Account (1) -> Transaction (N)
8. Category (1) -> Transaction (N)
9. Account (1) -> Goal (1)
10. Account (1) -> Debt (N)
11. Account (1) -> Subscription (N)
