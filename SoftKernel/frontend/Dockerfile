# Multi-stage build for frontend
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:5000
ARG VITE_ORACLE_PRIVATE_KEY
ARG VITE_ADMIN_ADDRESS=0x95e38e215CDe9655f6cF5E89E89d00e0BB62144a
ARG VITE_TREASURY_CONTRACT
ARG VITE_STREAM_CONTRACT
ARG VITE_OFFRAMP_CONTRACT

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ORACLE_PRIVATE_KEY=$VITE_ORACLE_PRIVATE_KEY
ENV VITE_ADMIN_ADDRESS=$VITE_ADMIN_ADDRESS
ENV VITE_TREASURY_CONTRACT=$VITE_TREASURY_CONTRACT
ENV VITE_STREAM_CONTRACT=$VITE_STREAM_CONTRACT
ENV VITE_OFFRAMP_CONTRACT=$VITE_OFFRAMP_CONTRACT

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
