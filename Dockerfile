
# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Configure production API URL
ARG VITE_API_URL=https://smartbus-backend-1-iuui.onrender.com/api
ENV VITE_API_URL=${VITE_API_URL}

# Build React/Vite frontend
RUN npm run build

# Runtime stage: Nginx serves static assets
FROM nginxinc/nginx-unprivileged:alpine

# Configure Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx listens on port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
