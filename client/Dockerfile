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
# Store content as backup — entrypoint copies to volume if empty
COPY --from=builder --chown=nextjs:nodejs /app/content ./content.default

# entrypoint: copy defaults into volumes if empty, then start
COPY --chown=nextjs:nodejs <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

# content
if [ -z "$(ls -A /app/content 2>/dev/null)" ]; then
  echo "Initializing /app/content from defaults..."
  cp -r /app/content.default/. /app/content/
fi

# images
if [ -z "$(ls -A /app/public/images/products 2>/dev/null)" ]; then
  echo "Initializing /app/public/images/products from defaults..."
  mkdir -p /app/public/images/products
  cp -r /app/public.default/images/products/. /app/public/images/products/ 2>/dev/null || true
fi

exec node server.js
EOF

COPY --from=builder --chown=nextjs:nodejs /app/public/images/products ./public.default/images/products

RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/entrypoint.sh"]
