# --- Build Stage ---
FROM node:20-slim AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source and config files
COPY . .

# Build argument for Next.js build-time environment variable
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js production bundle
RUN npm run build

# --- Runner Stage ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Keep the default API URL matching host/container mapping
ENV NEXT_PUBLIC_API_URL=http://localhost:4000

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy Next.js production build artifacts and configuration
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]
