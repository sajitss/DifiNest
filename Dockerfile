# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production Server (Node.js Express + Static Files Engine)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Create volume directory for admin-uploaded static apps and catalog JSON
RUN mkdir -p /app/data/apps

ENV PORT=80
ENV DATA_DIR=/app/data

EXPOSE 80

CMD ["node", "server.js"]
