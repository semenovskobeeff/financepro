FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY server/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY server/ ./

# Стадия запуска
FROM node:20-alpine

WORKDIR /app

# Создаем пользователя без прав root
RUN addgroup -S nodeapp && adduser -S -G nodeapp nodeapp

# Копируем зависимости и собранное приложение
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

# Меняем владельца файлов
RUN chown -R nodeapp:nodeapp /app

# Переключаемся на пользователя без прав root
USER nodeapp

EXPOSE 3000

CMD ["node", "src/app.js"] 