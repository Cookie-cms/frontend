FROM node:20-bullseye AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Очищаем кеш npm и устанавливаем зависимости
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install --legacy-peer-deps

# Копируем остальные файлы проекта
COPY . .

# Создаем оптимизированную production-сборку
RUN npm run build

# Этап production - используем тот же базовый образ
FROM node:20-bullseye AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm cache clean --force
RUN npm install --omit=dev --legacy-peer-deps

# Копируем файлы сборки из предыдущего этапа
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Устанавливаем переменную окружения для production
ENV NODE_ENV=production

# Запускаем приложение
CMD ["npm", "start"]