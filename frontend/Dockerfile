# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy frontend package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy shared folder
COPY shared ./shared

# Copy frontend source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react -u 1001

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 