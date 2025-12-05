# Etapa de build con Node 20 (Angular 20 lo exige)
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa para servir el frontend con Nginx
FROM nginx:stable

# Copiamos el build REAL de tu proyecto (según tu captura)
COPY --from=build /app/dist/FrontendDelyra/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
