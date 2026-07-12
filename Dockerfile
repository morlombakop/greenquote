# --- Stage 1: Dependencies ---
FROM node:24.18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies like postcss and tailwind)
RUN npm ci

# --- Stage 2: Builder ---
FROM node:24.18-alpine AS builder
WORKDIR /app

# 1. Copy the source code first
COPY . .

# 2. Overwrite / safeguard the clean container node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Opt out of telemetry data collection
ENV NEXT_TELEMETRY_DISABLED=1

# Satisfy Prisma initialization requirements during schema compilation
ENV DATABASE_URL="postgresql://mock:mock@localhost:5432/mock?schema=public"

RUN npm install cross-env
# Generate Prisma Client and build the Next.js production bundle 
# (We pass NODE_ENV here explicitly inside the cross-env script rather than the whole build stage)
RUN npm run build

# --- Stage 3: Runner ---
FROM node:24.18-alpine AS runner
WORKDIR /app

# Enforce strict production optimizations for runtime execution
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-privileged system user for security hardening
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential runtime files from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Copy over the built files and production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Execute migrations safely and start the server
CMD ["sh", "-c", "DATABASE_URL=postgresql://admin:admin_password@db:5432/greenquote?schema=public npx prisma migrate deploy --schema=./prisma/schema.prod.prisma --config ./prisma.config.ts && npx prisma db seed --schema=./prisma/schema.prod.prisma && npm run start"]
