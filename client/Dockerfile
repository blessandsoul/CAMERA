FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --prefer-offline

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Store defaults for seeding volumes on first run
COPY --from=builder --chown=nextjs:nodejs /app/content ./content.default
COPY --from=builder --chown=nextjs:nodejs /app/public/images/products ./public.default/images/products

# entrypoint runs as root to fix permissions, then drops to nextjs
COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

# Seed content volume if empty
if [ -z "$(ls -A /app/content 2>/dev/null)" ]; then
  echo "Seeding /app/content..."
  mkdir -p /app/content
  cp -r /app/content.default/. /app/content/
  chown -R nextjs:nodejs /app/content
fi

# Seed images volume if empty
if [ -z "$(ls -A /app/public/images/products 2>/dev/null)" ]; then
  echo "Seeding /app/public/images/products..."
  mkdir -p /app/public/images/products
  cp -r /app/public.default/images/products/. /app/public/images/products/ 2>/dev/null || true
  chown -R nextjs:nodejs /app/public/images/products
fi

exec su-exec nextjs node server.js
EOF

RUN chmod +x /app/entrypoint.sh && \
    apk add --no-cache su-exec

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/entrypoint.sh"]
