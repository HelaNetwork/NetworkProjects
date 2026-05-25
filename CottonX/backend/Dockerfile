FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npx tsc

# Cloud Run uses PORT env var (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/server.js"]
