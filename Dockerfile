# Stage 1: build the production bundle with Node.js LTS
FROM node:lts-alpine AS build

WORKDIR /app

# Vite bakes VITE_* variables into the bundle at build time — the .env file
# is excluded from the build context (.dockerignore), so they come in as
# build args (the browser calls the APIs, so localhost URLs are correct).
ARG VITE_FAKE_STORE_API_URL=https://fakestoreapi.com
ARG VITE_CART_API_URL=http://localhost:8000
ARG VITE_AUTH_API_URL=http://localhost:8001
ARG VITE_PAYMENT_API_URL=http://localhost:8002
ARG VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
ARG VITE_OTEL_SERVICE_NAME=puc-arq-software-front

ENV VITE_FAKE_STORE_API_URL=$VITE_FAKE_STORE_API_URL \
    VITE_CART_API_URL=$VITE_CART_API_URL \
    VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_PAYMENT_API_URL=$VITE_PAYMENT_API_URL \
    VITE_OTEL_EXPORTER_OTLP_ENDPOINT=$VITE_OTEL_EXPORTER_OTLP_ENDPOINT \
    VITE_OTEL_SERVICE_NAME=$VITE_OTEL_SERVICE_NAME

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files and build the production bundle
COPY . .
RUN npm run build

# Stage 2: serve the static bundle with nginx
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
