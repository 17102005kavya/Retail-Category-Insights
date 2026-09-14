# Stage 1: Build Angular Application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors
COPY package*.json ./
RUN npm ci

# Copy sources and build production bundle
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default static assets
RUN rm -rf ./*

# Copy built Angular artifacts and custom nginx configuration
COPY --from=build /app/dist/RetailCategoryInsights.Client/browser .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
