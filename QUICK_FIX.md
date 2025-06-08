# 🚨 БЫСТРОЕ ИСПРАВЛЕНИЕ ОШИБКИ 500

## Проблема

Railway сервер возвращает ошибку 500 из-за отсутствующих переменных окружения.

## Быстрое решение (5 минут)

### 1. Зайти в Railway

- Откройте https://railway.app
- Найдите проект `finance-app`
- Перейдите в **Variables**

### 2. Добавить переменные

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-app
JWT_SECRET=super-long-secret-key-123456789
CLIENT_URL=https://financepro-patx.vercel.app
SEED_DATABASE=false
```

### 3. Redeploy

- Нажать **Deploy** → **Redeploy**
- Дождаться завершения

## Нужна MongoDB Atlas?

1. Зайти на https://mongodb.com/atlas
2. Создать бесплатный кластер
3. Добавить IP `0.0.0.0/0` в Network Access
4. Скопировать connection string

## Проверка

Откройте: https://web-production-df536-us.railway.app/api

Должно показать информацию об API вместо ошибки 500.

---

📖 Подробная инструкция: `RAILWAY_SETUP.md`
