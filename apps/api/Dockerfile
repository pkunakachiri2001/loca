# Build context MUST be the root of the monorepo
# In Render, leave "Root Directory" completely BLANK.
# Set "Dockerfile Path" to "apps/api/Dockerfile".

FROM node:20-alpine AS builder

WORKDIR /app

# Copy the entire monorepo to get access to prisma folder
COPY . .

# Install all dependencies (required for monorepo workspaces)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine
WORKDIR /app

# Copy root node_modules and prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Copy API files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package*.json ./apps/api/

# Start the API
WORKDIR /app/apps/api
EXPOSE 8080
CMD ["npm", "start"]
