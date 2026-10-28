# syntax=docker/dockerfile:1

# BloodLink production image: Next.js standalone output on Node 24 (Alpine).
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://bloodlink.example.com -t bloodlink .
# Multi-instance deployments can pin the Server Actions key at build time with
#   --secret id=next_actions_key,env=NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Some native packages expect glibc symbols; see the Next.js Docker example.
RUN apk add --no-cache libc6-compat

# 1. Install dependencies from the lockfile only, so this layer is cached between code changes.
FROM base AS deps
# mongodb-memory-server (tests only) would otherwise download a mongod binary during install.
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# 2. Build. NEXT_PUBLIC_* values are inlined into the bundles, so they must be known here.
FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$NEXT_PUBLIC_SITE_URL" || { echo "Build arg NEXT_PUBLIC_SITE_URL is required (e.g. https://bloodlink.example.com)" >&2; exit 1; }
RUN --mount=type=secret,id=next_actions_key \
  if [ -s /run/secrets/next_actions_key ]; then \
    export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_actions_key)"; \
  fi; \
  npx next build

# 3. Minimal runtime: only the traced standalone server, static assets and public files.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# /api/health also pings MongoDB, so the container is only "healthy" when it can serve requests.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node", "server.js"]
