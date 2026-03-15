# --- GIAI ĐOẠN 1: THỢ XÂY ---
# Xài Node 20 cho Prisma nó vui, đéo cần cài thêm bất cứ cái apk C++ nào hết!
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Cài npm nhẹ nhàng như lông hồng, sharp 0.32.6 sẽ tự tải cục binary 1 giây là xong!
RUN npm install

COPY . .
RUN DATABASE_URL="mysql://fake:fake@localhost:3306/fake" npx prisma generate


# --- GIAI ĐOẠN 2: RUNTIME ---
FROM node:20-alpine
WORKDIR /app

# Chỉ cài openssl cho Prisma connect Database
RUN apk update && apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["npm", "start"]