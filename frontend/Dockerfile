FROM node:22-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS development
COPY --from=install /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS production
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--port", "5173"]
