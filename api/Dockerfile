# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=install /app/node_modules ./node_modules
COPY . .
EXPOSE ${PORT:-3000}
CMD ["bun", "--hot", "server.js"]

# Production stage
FROM base AS production
COPY --from=install /app/node_modules ./node_modules
COPY . .
EXPOSE ${PORT:-3000}
CMD ["bun", "server.js"]