# Multi-stage Dockerfile for Next.js + Prisma

# 1) Install dependencies
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) Build the app
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client before building
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi
RUN npm run build

# 3) Runtime image
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy minimal runtime artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Apply migrations if available, then always align schema via db push, then start Next.js
CMD ["sh","-c","npx prisma migrate deploy || true; npx prisma db push; npm start"]
