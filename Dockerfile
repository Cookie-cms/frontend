FROM node:18-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости с флагом legacy-peer-deps
RUN npm ci --legacy-peer-deps

# Копируем остальные файлы проекта
COPY . .

# Создаем оптимизированную production-сборку
RUN npm run build

# Этап production
FROM node:18-alpine AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только production зависимости с флагом legacy-peer-deps
RUN npm ci --omit=dev --legacy-peer-deps

# Копируем файлы сборки из предыдущего этапа
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
# COPY --from=build /app/next.config.js ./next.config.js

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Устанавливаем переменную окружения для production
ENV NODE_ENV=production

# Запускаем приложение
CMD ["npm", "start"]

