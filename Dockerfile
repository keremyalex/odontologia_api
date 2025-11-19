# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Si quieres usar variables de entorno PORT, etc.
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
