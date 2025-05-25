FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY client/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY client/ ./

# Собираем приложение
RUN npm run build

# Стадия запуска
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY infrastructure/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 