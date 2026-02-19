FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# Install dependencies - cached separately from source code
# Build context: repo root (docker build -f client/Dockerfile .)
FROM base AS deps
WORKDIR /app
COPY client/package.json client/package-lock.json* ./
RUN npm install --prefer-offline

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY client/ .
# Copy content directory (lives at repo root, outside client/)
COPY content/ ../content/

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image - minimal
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy content so server.js can read MDX files at runtime
# process.cwd() = /app, content.ts reads path.join(cwd, '..', 'content') = /content
COPY --from=builder /content /content

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
