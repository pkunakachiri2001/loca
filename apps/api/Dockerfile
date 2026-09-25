# Stage 1: Builder
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install OpenSSL 1.1 compatibility (required by Prisma engine)
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Runner
# ──────────────────────────────────────────────
FROM node:20-alpine

# Install OpenSSL 1.1 compatibility (required by Prisma engine at RUNTIME)
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy package and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist

# Ensure we have the generated Prisma client for runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

CMD ["npm", "start"]
