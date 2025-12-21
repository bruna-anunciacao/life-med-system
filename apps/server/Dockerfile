FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma/

RUN npm install

COPY . .

RUN npx prisma generate --schema=./apps/server/prisma/schema.prisma
RUN npm run build --workspace=apps/server

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/server/prisma ./prisma

EXPOSE 3000

CMD npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js