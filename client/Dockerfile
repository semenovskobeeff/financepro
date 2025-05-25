# Используем официальный образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы
COPY . .

# Открываем порт
EXPOSE 8000

# Запускаем dev сервер с хостом 0.0.0.0 для доступа извне контейнера
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8000"]
