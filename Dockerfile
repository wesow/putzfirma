# 1. Build Phase
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
# --legacy-peer-deps erlaubt die Installation trotz React 19 Konflikt
RUN npm ci --legacy-peer-deps
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