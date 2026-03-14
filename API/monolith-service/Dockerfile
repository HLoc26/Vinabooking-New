FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
COPY . .

# Phase 1: Build Time (Fake URL just to create the TypeScript code)
RUN DATABASE_URL="mysql://fake:fake@localhost:3306/fake" npx prisma generate
RUN npm run build

EXPOSE 8080

# Phase 2: Runtime (Real URL injected by docker-compose)
# We run the migration, and IF it succeeds (&&), we start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]