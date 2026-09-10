# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache python3

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY . .

# Generate lib/content.js from the operational plan markdown.
RUN python3 tools/build-content.py

# Crop the source seal and strip its white field into public/logo*.webp
RUN node tools/prepare-logo.mjs

RUN SITE_PASSWORD=build SESSION_SECRET=build npm run build

# ---- run ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
USER node
CMD ["node", "server.js"]
