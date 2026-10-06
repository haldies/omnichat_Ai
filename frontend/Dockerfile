# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL=http://localhost:3001
ARG VITE_RAG_API_URL=http://localhost:8000
ARG VITE_SOCKET_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL \
    VITE_RAG_API_URL=$VITE_RAG_API_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
