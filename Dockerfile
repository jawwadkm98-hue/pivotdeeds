FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_PATH=/data/crownwholesalers.sqlite
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN mkdir -p /data && chown node:node /data
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
VOLUME ["/data"]
CMD ["npm", "start"]
