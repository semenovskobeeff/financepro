#!/bin/bash

echo "🔄 Переключение на режим разработки..."

# Переключаем на .env для разработки
cd "$(dirname "$0")/.."
ln -sf .env.development server/.env

echo "📝 Используется server/.env.development"
echo "🐳 Запуск с локальной MongoDB..."

# Запуск с профилем development (включая mongo)
docker-compose --profile development up -d

echo "✅ Приложение запущено в режиме разработки"
echo "📚 API: http://localhost:3002/api"
echo "🌐 Фронтенд: http://localhost:8000"
echo "📊 MongoDB: localhost:27017"
