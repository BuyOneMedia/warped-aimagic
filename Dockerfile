# ─────────────────────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# Stage 2: Build Next.js app + generate Prisma client
# Uses node:20-slim (Debian-based) for Playwright compatibility
# ─────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Install Playwright's Chromium system dependencies
RUN apt-get update && apt-get install -y \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libxcb1 \
    libxext6 libxss1 fonts-liberation wget ca-certificates \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client with the correct binary for this OS
RUN npx prisma generate

# Install Playwright Chromium browser binary
RUN npx playwright install chromium

# Build the Next.js application (standalone output)
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3: Production runner
# ─────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3072

# Install Playwright system dependencies again in runner
RUN apt-get update && apt-get install -y \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libxcb1 \
    libxext6 libxss1 fonts-liberation wget ca-certificates \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema + client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Playwright browser binaries
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# Copy workers directory (for the BullMQ worker container)
COPY --from=builder /app/workers ./workers
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3072

HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:3072 || exit 1

# Default: run Next.js web app
# Override with: npm run worker  for the BullMQ worker container
CMD ["node", "server.js"]