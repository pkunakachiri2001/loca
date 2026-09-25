# Stage 1: Builder
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

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

# Expose port (Render defaults to 10000, but Express config uses 8080 or PORT env)
EXPOSE 8080

CMD ["npm", "start"]
