# --- Build Stage ---
FROM node:20-slim AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install build tools for native modules (like better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install all dependencies
RUN npm ci

# Copy configuration and source files
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript application
RUN npm run build

# --- Runner Stage ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=/app/data/todos.sqlite

# Copy package files
COPY package*.json ./

# Install only production dependencies (native modules built for target)
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm ci --omit=dev && \
    apt-get purge -y python3 make g++ && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Copy compiled JavaScript files
COPY --from=builder /app/dist ./dist

# Create folder for persistent SQLite data
RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "dist/server.js"]
