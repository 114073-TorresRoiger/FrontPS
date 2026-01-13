# Etapa 1: Build de la aplicación Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --prefer-offline --no-audit

# Copiar el resto del código
COPY . .

# Build de producción
RUN npm run build -- --configuration=production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=build /app/dist/app-oficios/browser /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
