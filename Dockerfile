# 1. Build Phase
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Run Phase
FROM nginx:alpine
# React Build kopieren
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx Config kopieren (liegt jetzt im selben Ordner wie dieses Dockerfile)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]