# Stage 1: Build TypeScript
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy TypeScript source and config
COPY tsconfig.json ./
COPY src ./src

# Compile TS to JS
RUN npm run build   # assumes "build": "tsc" in package.json

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JS from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
