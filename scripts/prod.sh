#!/bin/bash

echo "🚀 Переключение на режим продакшена..."

# Переключаем на .env для продакшена
cd "$(dirname "$0")/.."
ln -sf .env.production server/.env

echo "📝 Используется server/.env.production"
echo "☁️ Подключение к MongoDB Atlas..."

# Запуск без профиля (без локальной mongo)
docker-compose up -d server

echo "✅ Приложение запущено в режиме продакшена"
echo "📚 API: http://localhost:3002/api"
echo "☁️ MongoDB: Atlas Cloud"
echo "🌐 Клиент: https://financepro-patx.vercel.app"
