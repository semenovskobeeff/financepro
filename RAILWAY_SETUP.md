# 🚂 Настройка Railway для Finance App

## ❌ Текущая проблема

На продакшене Railway возникают ошибки 500, потому что не настроены переменные окружения.

**Ошибки в консоли:**

- `Failed to load resource: the server responded with a status of 500 ()`
- `[API] Внутренняя ошибка сервера: Object`

## ✅ Решение

Нужно настроить переменные окружения в панели Railway:

### 1. Зайдите в панель Railway

- Откройте [railway.app](https://railway.app)
- Найдите проект `finance-app`
- Перейдите в раздел **Variables**

### 2. Добавьте обязательные переменные

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-app?retryWrites=true&w=majority
JWT_SECRET=your-very-long-and-secure-secret-key-here-change-in-production-123456789
CLIENT_URL=https://financepro-patx.vercel.app
SEED_DATABASE=false
```

### 3. Настройки MongoDB Atlas

**Если MongoDB Atlas еще не настроен:**

1. Зайдите на [mongodb.com](https://www.mongodb.com/atlas)
2. Создайте бесплатный кластер
3. Настройте IP Whitelist (добавьте `0.0.0.0/0` для Railway)
4. Создайте пользователя БД
5. Получите строку подключения

### 4. Дополнительные переменные (опционально)

```env
# Для email уведомлений
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔧 Пошаговая настройка Railway

### Шаг 1: Переменные окружения

1. Откройте проект на Railway
2. Выберите сервис (backend)
3. Перейдите в **Variables**
4. Нажмите **+ New Variable**
5. Добавьте каждую переменную:

| Переменная      | Значение                             | Описание                       |
| --------------- | ------------------------------------ | ------------------------------ |
| `NODE_ENV`      | `production`                         | Режим продакшена               |
| `MONGODB_URI`   | `mongodb+srv://...`                  | Подключение к БД               |
| `JWT_SECRET`    | `длинный-секретный-ключ`             | Для JWT токенов                |
| `CLIENT_URL`    | `https://financepro-patx.vercel.app` | URL фронтенда                  |
| `SEED_DATABASE` | `false`                              | Не заполнять тестовыми данными |

### Шаг 2: Генерация JWT_SECRET

```bash
# В терминале выполните:
openssl rand -base64 64
```

### Шаг 3: Redeploy

После добавления переменных:

1. Перейдите в **Deployments**
2. Нажмите **Redeploy**
3. Дождитесь завершения деплоя

## 🔍 Проверка работоспособности

После настройки откройте:

- `https://web-production-df536-us.railway.app/` - должен отвечать
- `https://web-production-df536-us.railway.app/api` - должен показывать API info
- `https://web-production-df536-us.railway.app/api/health/database` - проверка БД

## 📋 Чек-лист

- [ ] MongoDB Atlas настроен
- [ ] IP адреса Railway добавлены в Network Access
- [ ] Пользователь БД создан с правами readWrite
- [ ] Переменные окружения добавлены в Railway
- [ ] JWT_SECRET сгенерирован и добавлен
- [ ] CLIENT_URL указывает на Vercel деплой
- [ ] Проект redeploy'ился
- [ ] API отвечает без ошибок 500

## 🚨 Частые ошибки

1. **MONGODB_URI неправильный** - проверьте username, password, cluster name
2. **IP блокируется** - добавьте 0.0.0.0/0 в Network Access MongoDB Atlas
3. **JWT_SECRET не задан** - сгенерируйте новый ключ
4. **CLIENT_URL неправильный** - должен точно совпадать с URL Vercel

## 🛠️ Отладка

Посмотрите логи Railway:

1. Откройте проект
2. Перейдите в **Deployments**
3. Выберите последний деплой
4. Посмотрите логи на наличие ошибок подключения к БД

**Ожидаемые логи при успешном запуске:**

```
🔍 Отладка переменных окружения:
NODE_ENV: production
PORT: 3000
MONGODB_URI установлен: true
MONGODB_URI (маскированный): mongodb+srv://***:***@cluster.mongodb.net/finance-app
JWT_SECRET установлен: true
CLIENT_URL: https://financepro-patx.vercel.app
🗄️ Подключение к MongoDB...
✅ Успешное подключение к MongoDB
🌐 Сервер запущен на порту 3000
```
