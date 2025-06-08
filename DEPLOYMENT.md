# 🚀 Руководство по развертыванию Finance App

## 🏗️ Архитектура проекта

Проект поддерживает два режима работы:

- **Development** - локальная разработка с локальной MongoDB
- **Production** - продакшен с облачной MongoDB Atlas

## 📁 Структура конфигурации

```
server/
├── .env.development     # Настройки для разработки
├── .env.production      # Настройки для продакшена
└── .env                 # Символическая ссылка на активный режим

scripts/
├── dev.sh              # Скрипт запуска в режиме разработки
└── prod.sh             # Скрипт запуска в продакшене
```

## ⚙️ Настройка

### 1. Создайте файлы конфигурации

**Для разработки (server/.env.development):**

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://mongo:27017/finance-app
JWT_SECRET=development-jwt-secret-key
SEED_DATABASE=true
CLIENT_URL=http://localhost:8000
```

**Для продакшена (server/.env.production):**

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
SEED_DATABASE=false
CLIENT_URL=https://financepro-patx.vercel.app

# Email настройки для восстановления пароля
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Сделайте скрипты исполняемыми

```bash
chmod +x scripts/dev.sh scripts/prod.sh
```

## 🔄 Переключение между режимами

### 🛠️ Режим разработки

**Запуск:**

```bash
./scripts/dev.sh
```

**Что происходит:**

- ✅ Активируется `server/.env.development`
- ✅ Запускается локальный контейнер MongoDB
- ✅ База данных заполняется тестовыми данными
- ✅ Сервер доступен на `http://localhost:3002/api`
- ✅ MongoDB доступна на `localhost:27017`

**Используется для:**

- Локальная разработка
- Тестирование новых функций
- Отладка без влияния на продакшен

---

### 🚀 Режим продакшена

**Запуск:**

```bash
./scripts/prod.sh
```

**Что происходит:**

- ✅ Активируется `server/.env.production`
- ✅ Подключается к MongoDB Atlas (облачная БД)
- ✅ Локальная MongoDB НЕ запускается
- ✅ Тестовые данные НЕ добавляются
- ✅ Сервер доступен на `http://localhost:3002/api`

**Используется для:**

- Продакшен развертывание
- Реальные пользователи
- Сохранение данных в облаке

## 📊 Проверка текущего режима

```bash
# Посмотреть активный режим
ls -la server/.env

# Посмотреть содержимое активной конфигурации
cat server/.env

# Проверить запущенные контейнеры
docker-compose ps

# Посмотреть логи сервера
docker-compose logs -f server
```

## 🔧 Управление сервисами

### Остановка всех сервисов

```bash
docker-compose down
```

### Перезапуск сервера

```bash
docker-compose restart server
```

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только сервер
docker-compose logs -f server

# Только MongoDB (в режиме разработки)
docker-compose logs -f mongo
```

### Очистка и пересборка

```bash
# Остановить и удалить контейнеры
docker-compose down --remove-orphans

# Пересборка с принудительной загрузкой
docker-compose build --no-cache

# Запуск с пересборкой
docker-compose up --build -d
```

## 🌐 Настройка фронтенда

### Локальная разработка

В Vercel Environment Variables:

```
VITE_API_URL=http://localhost:3002/api
```

### Продакшен

В Vercel Environment Variables:

```
VITE_API_URL=http://77.95.201.5:3002/api
```

## 🔐 Безопасность

### ⚠️ Важные моменты:

1. **Никогда не коммитьте .env файлы** с реальными паролями
2. **Смените JWT_SECRET** в продакшене на длинный случайный ключ
3. **Настройте IP Whitelist** в MongoDB Atlas
4. **Используйте сильные пароли** для email и БД

### Генерация безопасного JWT_SECRET:

```bash
# Генерация случайного ключа
openssl rand -base64 64
```

## 🐛 Troubleshooting

### Ошибка подключения к MongoDB Atlas

```bash
# Проверьте строку подключения
cat server/.env

# Проверьте логи сервера
docker-compose logs server | grep MongoDB
```

### Контейнер не запускается

```bash
# Проверьте синтаксис docker-compose.yml
docker-compose config

# Принудительная пересборка
docker-compose down && docker-compose up --build -d
```

### API недоступен

```bash
# Проверьте что сервер запущен
curl http://localhost:3002/api/health

# Проверьте порты
docker-compose ps
```

### Проблемы с переключением режимов

```bash
# Проверьте права на скрипты
ls -la scripts/

# Сделайте исполняемыми
chmod +x scripts/*.sh

# Проверьте символическую ссылку
ls -la server/.env
```

## 📞 Полезные команды

```bash
# Быстрая проверка всей системы
curl http://localhost:3002/api/health && echo "✅ API работает"
curl http://localhost:3002/api/health/database && echo "✅ БД работает"

# Подключение к MongoDB (режим разработки)
docker-compose exec mongo mongosh finance-app

# Просмотр использования ресурсов
docker stats

# Очистка неиспользуемых образов
docker system prune -f
```

## 🎯 Быстрый старт

```bash
# 1. Клонируйте репозиторий
git clone <repository-url>
cd financepro

# 2. Создайте файлы конфигурации (см. раздел "Настройка")

# 3. Запустите в режиме разработки
./scripts/dev.sh

# 4. Проверьте работу
curl http://localhost:3002/api/health
```

---

💡 **Совет:** Всегда используйте режим разработки для тестирования изменений перед деплоем в продакшен!

## Настройка аналитики в продакшене

### ⚠️ ВАЖНО: Моки недоступны в продакшене!

В продакшене приложение **НИКОГДА** не использует моковые данные. Все данные должны поступать из реальной базы данных.

### Диагностика проблем

При проблемах с аналитикой в консоли браузера будут отображаться ошибки:

- `❌ [API] Ошибка подключения к серверу` - сервер недоступен
- `⏰ [API] Таймаут запроса` - сервер слишком долго отвечает
- `💥 [API] Внутренняя ошибка сервера` - ошибка на стороне сервера

### Устранение проблем в продакшене

1. **Проверьте подключение к базе данных**
2. **Убедитесь что API сервер запущен**
3. **Проверьте URL API в переменных окружения**
4. **Проверьте CORS настройки сервера**
5. **Проверьте сетевое подключение**

### Переменные окружения для продакшена

```bash
VITE_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

### Очистка некорректных настроек

Если в продакшене случайно остались настройки моков, они будут автоматически удалены при загрузке страницы.

## Развертывание
