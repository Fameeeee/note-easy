# Dockerfile for Note Easy (Next.js + Prisma + MongoDB)
FROM node:20-alpine AS base
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production image
FROM node:20-alpine AS prod
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY --from=base /app .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
